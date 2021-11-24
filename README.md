# Cytoscape Explore

## Required software

- [Node.js](https://nodejs.org/en/) 14.x, >=14.15
- [CouchDB](http://couchdb.apache.org) ^2.x, >=2.3

## Getting started

- Windows Cloning

  - The `public` directory includes symlinks, which most versions of Windows Git will not correctly clone by default. Make sure to clone using the following command:
    - `git clone -c core.symlinks=true https://github.com/cytoscape/cytoscape-explore.git`

- Prerequisites:
  - Node.js
    - Option 1: Install [nvm](https://github.com/nvm-sh/nvm) so you can have multiple versions of node installed.
      - Install version 12 with `nvm install 12`.
      - Set version 12 as your default: `nvm alias default 12`.
      - To use a particular version, do `nvm use 12.0.1` or set up a `.nvmrc` file in the CWD and do `nvm use`.
    - Option 2: Install node manually:
      - Mac: `brew install node@12`
      - Linux: Use `dnf`, `zypper`, `apt`, etc.
      - Or use [the installer](https://nodejs.org/en/download/) for Mac or Windows
  - CouchDB
    - Mac: `brew install couchdb && brew services start couchdb`
    - Linux: Use `dnf`, `zypper`, `apt`, etc.
    - Or use [the installer](https://downloads.apache.org/couchdb/binary/mac/2.3.1/)
- Start off by running `npm install`.
- The main target you will run during development is `npm run watch`.
  - This automatically builds the clientside code in the background. The browser will refresh automatically when the code is rebuilt.
  - The server will automatically reload when you change the server code. That way new HTTP requests from the client will use the updated code right away.
- If you have CouchDB running locally on the default port, you don't need to configure any environment variables to get things working. The defaults are preset for local development.
- The Chrome debugger can be used for the clientside code (Chrome > View > Developer > Developer Tools) or the serverside code (`npm run inspect` and go to [chrome://inspect](chrome://inspect)). There is also an included launch config file that allows you to debug the client or the server directly in VSC.

## Editor

- [Visual Studio Code](https://code.visualstudio.com)
- Extensions
  - Must-haves
    - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) : Lint JS.
    - [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) : Lint CSS.
    - [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) : Use the VSC debugger on an instnace of Chrome, for debugging the browser UI.
  - Nice-to-haves
    - [GitHub Pull Requests and Issues](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github) : Easily browse and reference issues and pull requests.
    - [Live Share Extension Pack](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare-pack) : Do remote pair programming.
    - [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) : Manage docker images with a GUI.

## Configuration

The following environment variables can be used to configure the server:

- `NODE_ENV` : the environment mode, either `production` or `development` (default)
- `PORT` : the port on which the server runs (default 3000)
- `LOG_LEVEL` : the log level for `out.log`
- `COUCHDB_URL` : the URL of the CouchDB instance that the server should permanently store its data
- `USE_COUCH_AUTH` : set to `true` if you want to use CouchDB auth via `COUCHDB_USER` & `COUCHDB_PASSWORD`
- `COUCHDB_USER` : admin user name
- `COUCHDB_PASSWORD` : admin user password
- `LOG_SYNC` : log CouchDB operations when set to `true`
- `LOG_VIZMAPPER` : log VizMapper operations when set to `true`
- `BASE_URL` : the base url of the server (e.g. `https://example.com`)
- `UPLOAD_LIMIT` : max network upload size (e.g. `20kb`)
- `NDEX_API_URL`: the URL for the NDEx web application

## Run targets

- `npm start` : start the server (usually for prod mode)
- `npm run watch` : watch mode (debug mode enabled, autorebuild, autoreload)
- `npm run inspect` : start the server in inspection mode, with server-side code debuggable via the chrome debugger with a breakpoint automatically set on the first line ([chrome://inspect](chrome://inspect))
- `npm run build` : build project
- `npm run build-prod` : build the project for production
- `npm run bundle-profile` : visualise the bundle dependencies
- `npm run clean` : clean the project
- `npm run lint` : lint the project
- `npm run fix` : fix linting errors that can be automatically addressed
- `npm run test:mocha` : run model tests
- `npm test` : run model tests, linting, and a build (run this before doing a pull request)

## Running via Docker

Build the container. Here, `cytoscape-explore` is used as the container name.

```
cd cytoscape-explore
docker build -t cytoscape-explore .
```

Run the container:

```
docker run -it -p 12345:3000 -e "NODE_ENV=production" --name "my-cytoscape-explore" cytoscape-explore
```

Notes:

- The `-it` switches are necessary to make `node` respond to `ctrl+c` etc. in `docker`.
- The `-p` switch indicates that port 3000 on the container is mapped to port 12345 on the host. Without this switch, the server is inaccessible.
- The `-u` switch is used so that a non-root user is used inside the container.
- The `-e` switch is used to set environment variables. Alternatively use `--env-file` to use a file with the environment variables.
- References:
  - [Dockerizing a Node.js web app](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
  - [Documentation of docker-node](https://github.com/nodejs/docker-node)
  - [Docker CLI docs](https://docs.docker.com/engine/reference/commandline/cli/)

## Testing

All files `/test` will be run by [Mocha](https://mochajs.org/). You can `npm run test:mocha` to run all tests, or you can run `npm run test:mocha -- -g specific-test-name` to run specific tests.

[Chai](http://chaijs.com/) is included to make the tests easier to read and write.

By running `npm test`, you will run the tests, the linting, and a test build.

## Publishing a release

1. Make sure the tests are passing: `npm test`
1. Make sure the linting is passing: `npm run lint`
1. Bump the version number with `npm version`, in accordance with [semver](http://semver.org/). The `version` command in `npm` updates both `package.json` and git tags, but note that it uses a `v` prefix on the tags (e.g. `v1.2.3`).
1. For a bug fix / patch release, run `npm version patch`.
1. For a new feature release, run `npm version minor`.
1. For a breaking API change, run `npm version major.`
1. For a specific version number (e.g. 1.2.3), run `npm version 1.2.3`.
1. Push the release: `git push origin --tags`
