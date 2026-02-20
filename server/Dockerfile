# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npx prisma generate

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 banking && \
    adduser -D -u 1001 -G banking bankuser
COPY --from=builder --chown=bankuser:banking /app .
RUN mkdir -p logs prisma && chown -R bankuser:banking logs prisma
USER bankuser
EXPOSE 5000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1
CMD ["node", "src/index.js"]
