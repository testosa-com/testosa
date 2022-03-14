FROM node:12.22.10-alpine3.15

COPY ./bin /app/bin
COPY ./lib /app/lib
COPY ./scripts /app/scripts
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

WORKDIR /app

RUN npm ci --only=production

ENTRYPOINT ["npm", "run", "start", "--"]
