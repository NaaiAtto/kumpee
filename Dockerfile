FROM node:20-alpine

WORKDIR /app

# Copy all files
COPY index.html index.css app.js server.js ./

EXPOSE 8080

CMD ["node", "server.js"]
