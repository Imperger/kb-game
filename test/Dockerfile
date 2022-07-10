FROM node:18.4.0-alpine3.15

ARG SSL_CA
ENV SSL_CA=${SSL_CA}

WORKDIR /app

RUN mkdir /ca && echo "$SSL_CA" > /ca/root.crt

ENV NODE_EXTRA_CA_CERTS=/ca/root.crt

COPY . .

RUN npm i && \
    npm run build

ENTRYPOINT ["node", "dist/main"]
