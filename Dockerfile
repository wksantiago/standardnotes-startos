FROM node:20.10.0-alpine

RUN apk add --no-cache g++ make python3 openssl bash curl redis

WORKDIR /opt/server

COPY server/ ./

RUN corepack enable && \
    yarn install --immutable && \
    CI=true yarn build

COPY docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod +x /usr/local/bin/docker_entrypoint.sh

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]
