# Refer to:
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# https://github.com/nodejs/docker-node

FROM node:10

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app
COPY . /usr/src/app

# Install app dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Run the command that starts the app
CMD npm start
