# FROM ubuntu:latest
FROM node:argon

MAINTAINER Michael Zhang <me@michaelz.xyz>

RUN apt-get update
RUN apt-get -y upgrade

RUN DEBIAN_FRONTEND=noninteractive apt-get -y install libkrb5-dev npm

ENV MONGO_DB=cpanel
ENV MONGO_HOST=localhost
ENV MONGO_PORT=27017
ENV PORT=3000

EXPOSE 3000

RUN ln -s /usr/bin/nodejs /usr/bin/node

RUN mkdir /cpanel
ADD cpanel /cpanel

RUN cd /cpanel && npm install --save

CMD cd /cpanel && node app.js
