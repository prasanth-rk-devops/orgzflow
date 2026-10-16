# ============================================================
# Stage 1: Build React Application
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install Frontend Dependency
COPY package.json ./

RUN npm install 

# Copy Application Source Code
COPY . .

# Build Optimized Production assets
RUN npm run build

# =============================================================
# Stage 2: Production Nginx
# =============================================================

FROM nginx:alpine 

# Image Meta Data
LABEL org.opencontainers.image.title="OrgFrontend" \
      org.opencontainers.image.description="React frontend served by Nginx" \
      org.opencontainers.image.version="1.0.0" \
      org.openconatiners.image.vendor="OrgFlow"

# Remove nginx website default file
RUN rm -rf /usr/share/nginx/html/*

# Copy Production Assets from builder
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx Listen on Port 80
EXPOSE 80

# Container health Check
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 CMD wget -q -O /dev/null http://localhost:80 || exit 1

# Run Nginx In the Foreground
CMD ["nginx", "-g", "daemon off;"]