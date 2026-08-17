# Use pinned Node.js 20 Alpine image
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
RUN cp -R node_modules /tmp/node_modules-prod
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app
COPY --from=builder /tmp/node_modules-prod ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN chown -R appuser:appgroup /app
EXPOSE 3001
USER appuser
CMD ["node", "dist/main"]
