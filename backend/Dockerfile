# Stage 1: Build the Go application
FROM golang:1.24.2-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /main .

# Stage 2: Create a minimal production image
FROM alpine:latest

WORKDIR /root/

# Copy the compiled binary from the builder stage
COPY --from=builder /main .

# Expose port 3001
EXPOSE 3001

# Run the application
CMD ["./main"]
