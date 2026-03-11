# Etapa 1: build
FROM golang:1.26.1-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o auth-service ./cmd/main.go

# Etapa 2: imagen final mínima
FROM alpine:3.19

WORKDIR /app

COPY --from=builder /app/auth-service .

# Las claves RSA se montan como volumen o secreto en producción.
# No se incluyen en la imagen.
VOLUME ["/app/keys"]

EXPOSE 3000

CMD ["./auth-service"]
