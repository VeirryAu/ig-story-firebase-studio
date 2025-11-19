# syntax=docker/dockerfile:1

FROM golang:1.25.3 AS builder
WORKDIR /app
COPY go.mod go.sum* ./
COPY internal ./internal
COPY main.go ./
RUN apt-get update && apt-get install -y git && \
    rm -rf /var/lib/apt/lists/* && \
    go mod download && \
    go build -ldflags="-s -w" -o server .

FROM alpine:3.20
RUN addgroup -S forecap && adduser -S forecap -G forecap
WORKDIR /app
COPY --from=builder /app/server /usr/local/bin/server
ENV PORT=4001
EXPOSE 4001
USER forecap
CMD ["/usr/local/bin/server"]


