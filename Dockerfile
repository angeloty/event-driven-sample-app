FROM node:14.18-alpine as base
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
ENV APP_ENV=docker

FROM base as posts
ENV PORT=8080
EXPOSE 8080
CMD [ "npm", "run", "start:posts" ]

FROM base as users
ENV PORT=80
EXPOSE 80
CMD [ "npm", "run", "start:users" ]