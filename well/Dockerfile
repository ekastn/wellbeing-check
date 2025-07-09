# Stage 1: Build the Next.js application
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Create a minimal production image
FROM nginx:alpine

# Copy the built static files from the builder stage
COPY --from=builder /app/.next /usr/share/nginx/html/.next
COPY --from=builder /app/public /usr/share/nginx/html/public

# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
