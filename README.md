# Cytoscape Home


## Required software

- [Node.js](https://nodejs.org/en/) ^10.15.0
- [CouchDB](http://couchdb.apache.org) ^2.3.1


## Getting started

- Start off by running `npm install`.
- The main target you will run during development is `npm run watch`.
  - This automatically builds the clientside code in the background.  The browser will refresh automatically when the code is rebuilt.
  - The server will automatically reload when you change the server code.  That way new HTTP requests from the client will use the updated code right away.
- If you have CouchDB running locally on the default port, you don't need to configure any environment variables to get things working.  The defaults are preset for local development.
- The Chrome debugger can be used for the clientside code (Chrome > View > Developer > Developer Tools) or the serverside code (`npm run inspect` and go to [chrome://inspect](chrome://inspect)).  There is also an included launch config file that allows you to debug the client or the server directly in VSC.


## Configuration

The following environment variables can be used to configure the server:

- `NODE_ENV` : the environment mode, either `production` or `development` (default)
- `PORT` : the port on which the server runs (default 3000)
- `LOG_LEVEL` : the log level for `out.log`
- `COUCHDB_URL` : the URL of the CouchDB instance that the server should permanently store its data


## Run targets

- `npm start` : start the server (usually for prod mode)
- `npm run watch` : watch mode (debug mode enabled, autorebuild, autoreload)
- `npm run inspect` : start the server in inspection mode, with server-side code debuggable via the chrome debugger with a breakpoint automatically set on the first line ([chrome://inspect](chrome://inspect))
- `npm run build` : build project
- `npm run build-prod` : build the project for production
- `npm run bundle-profile` : visualise the bundle dependencies
- `npm run clean` : clean the project
- `npm test` : run tests
- `npm run lint` : lint the project
- `npm run ci` : run linting & tests (like Travis CI)

## Running via Docker

Build the container.  Here, `cytoscape-home` is used as the container name.

```
cd cytoscape-home
docker build -t cytoscape-home .
```

Run the container:

```
docker run -it -p 12345:3000 -u "node" -e "NODE_ENV=production" --name "cytoscape-home" cytoscape-home
```

Notes:

- The `-it` switches are necessary to make `node` respond to `ctrl+c` etc. in `docker`.
- The `-p` switch indicates that port 3000 on the container is mapped to port 12345 on the host.  Without this switch, the server is inaccessible.
- The `-u` switch is used so that a non-root user is used inside the container.
- The `-e` switch is used to set environment variables.  Alternatively use `--env-file` to use a file with the environment variables.
- References:
  - [Dockerizing a Node.js web app](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
  - [Documentation of docker-node](https://github.com/nodejs/docker-node)
  - [Docker CLI docs](https://docs.docker.com/engine/reference/commandline/cli/)



## Testing

All files `/test` will be run by [Mocha](https://mochajs.org/).  You can `npm test` to run all tests, or you can run `npm test -- -g specific-test-name` to run specific tests.

[Chai](http://chaijs.com/) is included to make the tests easier to read and write.



## Publishing a release

1. Make sure the tests are passing: `npm test`
1. Make sure the linting is passing: `npm run lint`
1. Bump the version number with `npm version`, in accordance with [semver](http://semver.org/).  The `version` command in `npm` updates both `package.json` and git tags, but note that it uses a `v` prefix on the tags (e.g. `v1.2.3`).
  1. For a bug fix / patch release, run `npm version patch`.
  1. For a new feature release, run `npm version minor`.
  1. For a breaking API change, run `npm version major.`
  1. For a specific version number (e.g. 1.2.3), run `npm version 1.2.3`.
1. Push the release: `git push origin --tags`

