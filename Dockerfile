FROM node:lts-buster-slim

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

CMD ["npm", "run", "ts"]