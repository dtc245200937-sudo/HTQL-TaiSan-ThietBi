#!/bin/sh
# Generate Self-Signed SSL Certificate for Local Nginx Proxy
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/key.pem \
  -out /etc/nginx/ssl/cert.pem \
  -subj "/C=VN/ST=Hanoi/L=Hanoi/O=DevOps/OU=IT/CN=localhost"
echo "SSL certificate generated successfully."
