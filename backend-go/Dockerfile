# syntax=docker/dockerfile:1

FROM golang:1.25.3 AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN apt-get update && apt-get install -y git && \
    rm -rf /var/lib/apt/lists/* && \
    go mod download
COPY internal ./internal
COPY main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates && \
    addgroup -S forecap && adduser -S forecap -G forecap
WORKDIR /app
COPY --from=builder /app/server /app/server
RUN chmod +x /app/server
ENV PORT=4001
EXPOSE 4001
USER forecap
CMD ["/app/server"]


