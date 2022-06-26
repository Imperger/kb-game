FROM node:18-alpine3.15

WORKDIR /app

RUN apk add --no-cache --virtual build-deps \
        python3 \
        g++ \
        build-base \
        cairo-dev \
        jpeg-dev \
        pango-dev \
        musl-dev \
        giflib-dev \
        pixman-dev \
        pangomm-dev \
        libjpeg-turbo-dev \
        freetype-dev

COPY --chown=node:node . .

RUN npm ci && \
    apk del build-deps && \
    apk add --no-cache \
        cairo \
        jpeg \
        pango \
        musl \
        giflib \
        pixman \
        pangomm \
        libjpeg-turbo \
        freetype && \
    npm install -g @nestjs/cli

ENTRYPOINT [ "npm", "start" ]

