FROM nginx:1.25-alpine

# Install openssl for self-signed cert generation
RUN apk add --no-cache openssl

# Create SSL directory and generate self-signed cert
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/key.pem \
      -out /etc/nginx/ssl/cert.pem \
      -subj "/C=VN/ST=Hanoi/L=Hanoi/O=Security/OU=IT/CN=localhost"

# Copy Nginx hardening configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/nginx_status || exit 1

CMD ["nginx", "-g", "daemon off;"]
