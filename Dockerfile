# Use official Node.js LTS image
FROM node:20-alpine
WORKDIR /app
RUN apk update && apk upgrade --no-cache
COPY package*.json ./
ENV HUSKY=0
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["node", "src/index.js"]
