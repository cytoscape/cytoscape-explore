FROM node:14

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
# Puppeteer requirements
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends

COPY . .
RUN NODE_ENV=development npm ci # dev b/c we need dev deps
RUN npm test # ensure test instances always pass tests before deploying
RUN NODE_ENV=production npm run build # build the clientside app in prod mode

EXPOSE 3000

CMD npm run start # run the server
