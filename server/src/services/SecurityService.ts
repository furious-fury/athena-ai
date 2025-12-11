
import { randomBytes, createCipheriv, createDecipheriv, hkdf } from 'crypto';
import { promisify } from 'util';

const hkdfAsync = promisify(hkdf);

/**
 * SecurityService - Handles encryption and decryption of sensitive data.
 * 
 * Specs:
 * - Algorithm: AES-256-GCM
 * - Key Derivation: HKDF-SHA256 (MasterKey + UserId => UserKey)
 * - IV: 12 bytes (Random per operation)
 * - Tag: 16 bytes (Default)
 * - AAD: UserId + Version (Binds ciphertext to user)
 */
export const SecurityService = {

    /**
     * Get Master Key from Env
     */
    getMasterKey(): Buffer {
        const keyHex = process.env.ENCRYPTION_KEY;
        if (!keyHex) {
            throw new Error("CRITICAL: ENCRYPTION_KEY is missing in .env");
        }
        if (keyHex.length !== 64) { // 32 bytes hex = 64 chars
            throw new Error("CRITICAL: ENCRYPTION_KEY must be 32 bytes hex string");
        }
        return Buffer.from(keyHex, 'hex');
    },

    /**
     * Derive a unique key for the user using HKDF
     * UserKey = HKDF(ikm=MasterKey, salt=userId, info="athena-user-key-v1")
     */
    async deriveUserKey(userId: string): Promise<Buffer> {
        if (!userId) throw new Error("UserId required for key derivation");
        const masterKey = this.getMasterKey();

        // HKDF-SHA256
        const derivedKey = (await hkdfAsync(
            'sha256',
            masterKey,
            userId,             // Salt
            'athena-user-key-v1', // Info (Versioned)
            32                  // Length (32 bytes for AES-256)
        )) as ArrayBuffer;

        return Buffer.from(derivedKey);
    },

    /**
     * Encrypts plaintext using AES-256-GCM derived for specific user.
     * Returns JSON string: { v: "1", iv: "...", ct: "...", tag: "..." }
     */
    async encrypt(text: string, userId: string): Promise<string> {
        const userKey = await this.deriveUserKey(userId);
        const iv = randomBytes(12); // 96-bit IV

        const cipher = createCipheriv('aes-256-gcm', userKey, iv);

        // Add AAD (Additional Authenticated Data) to bind ciphertext to this user
        // If someone copies the DB cell to another user, decryption will fail.
        const aad = Buffer.from(userId + "v1");
        cipher.setAAD(aad);

        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const authTag = cipher.getAuthTag().toString('base64');

        // Zeroize key buffer immediately
        userKey.fill(0);

        return JSON.stringify({
            v: "1",
            iv: iv.toString('base64'),
            ct: encrypted,
            tag: authTag
        });
    },

    /**
     * Decrypts ciphertext for a specific user.
     */
    async decrypt(encryptedBlob: string, userId: string): Promise<string> {
        // 1. Parse
        let data;
        try {
            data = JSON.parse(encryptedBlob);
        } catch (e) {
            // Fallback check: Is it raw plaintext (legacy)?
            // We assume migration script handles this, but safety check:
            // If it doesn't look like JSON or missing fields, throw or return raw?
            // Security-first: Fail if not valid format.
            // But for migration transition, we might encounter mixed state. 
            // HOWEVER, the plan says migration script handles everything. 
            // We will throw here to ensure we don't accidentally use plaintext as secret.
            throw new Error("Invalid encryption format");
        }

        if (data.v !== "1") {
            throw new Error(`Unsupported encryption version: ${data.v}`);
        }

        const userKey = await this.deriveUserKey(userId);
        const iv = Buffer.from(data.iv, 'base64');
        const authTag = Buffer.from(data.tag, 'base64');

        const decipher = createDecipheriv('aes-256-gcm', userKey, iv);

        // Verify AAD
        const aad = Buffer.from(userId + "v1");
        decipher.setAAD(aad);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(data.ct, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        // Zeroize key buffer
        userKey.fill(0);

        return decrypted;
    }
};
