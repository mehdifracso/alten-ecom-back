FROM node:20-alpine

WORKDIR /app


COPY package*.json ./
COPY yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD [  "npm", "run", "start:prod" ]