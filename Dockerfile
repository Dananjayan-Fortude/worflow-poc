FROM node

WORKDIR /app

COPY . ./

RUN npm ci

EXPOSE 3000

CMD [ "node", "main.js" ]