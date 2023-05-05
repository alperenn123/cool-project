FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

COPY tsconfig.json .

COPY .env .

RUN npm run build

ENV PORT 3000

EXPOSE 3000

CMD npm start