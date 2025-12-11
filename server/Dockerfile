FROM node:18-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]
