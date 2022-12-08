FROM node:16

WORKDIR /teamplay_backend/
COPY ./package.json /teamplay_backend/
COPY ./yarn.lock /teamplay_backend/
RUN yarn install

COPY . /teamplay_backend/
CMD yarn start:dev