FROM couchdb:2.3.1

ENV NODE_VERSION 12.19.0
ENV NVM_VERSION 0.37.2
ENV APP_DIR /usr/src/app

# Make bash the default shell for nvm
SHELL ["/bin/bash", "--login", "-c"]

# Create app directory
RUN mkdir -p $APP_DIR
#RUN mkdir -p $NVM_DIR
WORKDIR $APP_DIR

# Bundle app
COPY . $APP_DIR

# Install base dependencies
RUN apt-get update && apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        wget

# Install nvm, node, & npm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh | bash
RUN nvm install $NODE_VERSION

# Install app dependencies
RUN echo npm install
RUN NODE_ENV=development npm install
RUN npm run build

# Expose port
EXPOSE 3000

# Run the command that starts the app
CMD npm start
