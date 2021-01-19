FROM node:12

ENV APP_DIR /usr/src/app

# Create app directory
RUN mkdir -p $APP_DIR
#RUN mkdir -p $NVM_DIR
WORKDIR $APP_DIR

# Bundle app
COPY . $APP_DIR

# Install app dependencies
RUN npm install
RUN npm run build

# Expose port
EXPOSE 3000

# Run the command that starts the app
CMD npm start
