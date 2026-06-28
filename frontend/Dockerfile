# Onlinja Frontend Dockerfile
FROM node:26-alpine AS builder

WORKDIR /app

# Install system tools
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Install packages
RUN npm ci

# Copy remaining source modules
COPY . .

# Build static web assets via Expo CLI
RUN npx expo export --platform web

# Production Stage with Nginx
FROM nginx:stable-alpine

# Copy the web build
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the web app port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
