FROM node:alpine
EXPOSE 80
COPY dist /var/www/twexport
WORKDIR /var/www/twexport
RUN npm install
ENV PORT 80
CMD node app
