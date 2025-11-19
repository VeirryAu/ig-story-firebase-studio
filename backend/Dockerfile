# Multi-stage build for optimized Docker image
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY src ./src

# Build application
RUN npm run build

# Production stage
FROM node:20

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm i --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]

