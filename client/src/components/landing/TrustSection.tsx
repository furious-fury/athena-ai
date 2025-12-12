import { Shield, Newspaper } from 'lucide-react';
import { LargeCard } from './LargeCard';

export function TrustSection() {
    return (
        <section className="bg-main/50 py-48 relative border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Why Trust Us / Large Cards */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Trust Athena?</h2>
                    <p className="text-gray-400">Built for transparency, speed, and security.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    <LargeCard
                        title="News Driven Intelligence"
                        description="Our agents ingest data from 14+ premium sources including Bloomberg, CoinDesk, and TechCrunch. We use LLMs to extract high-confidence signals and instantly match them to prediction markets."
                        action="View Sources"
                        gradient="bg-linear-to-br from-blue-900/40 to-transparent"
                        icon={<Newspaper className="w-12 h-12 text-blue-400 mb-6" />}
                    />
                    <LargeCard
                        title="Institutional Grade Security"
                        description="Non custodial architecture means your funds never leave your wallet until execution. Private keys are encrypted at rest using AES-256-GCM with HKDF key derivation."
                        action="Learn More"
                        gradient="bg-linear-to-br from-purple-900/40 to-transparent"
                        icon={<Shield className="w-12 h-12 text-purple-400 mb-6" />}
                    />
                </div>
            </div>
        </section>
    );
}
