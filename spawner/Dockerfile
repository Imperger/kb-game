FROM node:18.4.0-alpine3.15 as build

ENV NODE_ENV=production
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN npm install -g @nestjs/cli

WORKDIR /build

COPY . .

RUN npm i && \
    npm run build




FROM node:18.4.0-alpine3.15

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /build/dist dist
COPY --from=build /build/node_modules node_modules

ENTRYPOINT ["node", "dist/main"]
