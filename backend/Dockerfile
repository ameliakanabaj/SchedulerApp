FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npx prisma generate

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app /app

EXPOSE 8083

CMD ["npm", "start"]

# FROM node:20

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npx prisma generate

# EXPOSE 8083
# EXPOSE 5555

# CMD ["npm", "run", "dev"]
