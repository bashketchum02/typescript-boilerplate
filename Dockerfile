FROM node:14-slim

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN yarn install

EXPOSE 1337

CMD ["node", "./dist/app.js"]