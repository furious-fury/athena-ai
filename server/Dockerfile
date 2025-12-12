FROM node:18-alpine

WORKDIR /app

# Copy source code (Moved up for debugging context)
COPY . .

# Debug: List files to confirm package.json exists
RUN ls -R

# Install production dependencies
RUN npm install --legacy-peer-deps

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]
