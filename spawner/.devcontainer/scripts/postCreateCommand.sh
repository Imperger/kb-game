#/bin/sh

sudo chown node:node /var/run/docker.sock && \
npm install -g @nestjs/cli