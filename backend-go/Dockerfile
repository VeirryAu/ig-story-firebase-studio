# syntax=docker/dockerfile:1

FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY internal ./internal
COPY main.go ./
RUN apk add --no-cache git && \
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


