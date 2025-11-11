FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 8083
EXPOSE 5555

CMD ["npm", "run", "dev"]
