FROM node:16-bullseye as build

WORKDIR /build

COPY . .

RUN npm i

ENTRYPOINT ["npm", "run", "build:volume"]
