FROM node:16.16.0-buster-slim

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

CMD ["npm", "start"]