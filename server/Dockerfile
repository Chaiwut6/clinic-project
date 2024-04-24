FROM node:21


WORKDIR /usr/src/app


COPY ./package.json ./

RUN npm install


COPY ./index.js ./


EXPOSE 8000


CMD ["npx", "nodemon", "--legacy-watch", "index.js"]

