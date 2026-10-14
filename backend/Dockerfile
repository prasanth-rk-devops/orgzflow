# Production Backend image

FROM node:20-alpine

LABEL org.opencontainers.image.title="Backend API"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.description="Production Backend API"
LABEL org.opencontainers.image.authors="maya patel maya.patel@orgflow.local"

WORKDIR /app

ENV NODE_ENV=production

ENV UPLOAD_DIR=/app/uploads

COPY package.json ./

RUN npm install --omit=dev && npm cache clean --force

COPY src ./src

RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 CMD wget -q0- http://localhost:4000/api/health || exit 1

CMD ["node", "src/server.js"]