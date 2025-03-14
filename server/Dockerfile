FROM node:21

WORKDIR /usr/src/app

COPY server/package.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
