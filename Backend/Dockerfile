FROM node:22-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM base AS production
EXPOSE 5000
CMD ["node", "index.js"]
