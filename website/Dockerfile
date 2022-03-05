FROM node:14.19.0-alpine3.15

COPY ./docs /app/docs
COPY ./src /app/src
COPY ./static /app/static
COPY ./versioned_docs /app/versioned_docs
COPY ./versioned_sidebars /app/versioned_sidebars
COPY ./babel.config.js /app/babel.config.js
COPY ./docusaurus.config.js /app/docusaurus.config.js
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./sidebars.js /app/sidebars.js
COPY ./versions.json /app/versions.json

WORKDIR /app

RUN npm ci --only=production
RUN npm run build

CMD npm run serve -- --port 8000 --host 0.0.0.0

EXPOSE 80 8000
