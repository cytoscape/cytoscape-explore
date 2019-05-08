import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import debug from 'debug';
import http from 'http';
import logger from './logger';
import fs from 'fs';
import { NODE_ENV, PORT, COUCHDB_URL } from './env';
import proxy from 'express-http-proxy';
import stream from 'stream';

const debugLog = debug('cytoscape-home:server');
const app = express();
const server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, '../', 'views'));

// define an inexpensive html engine that doesn't do serverside templating
app.engine('html', function (filePath, options, callback){
  fs.readFile(filePath, function (err, content) {
    if( err ){ return callback( err ); }

    return callback( null, content.toString() );
  });
});

app.set('view engine', 'html');

app.use(favicon(path.join(__dirname, '../..', 'public', 'icon.png')));

app.use(morgan('dev', {
  stream: new stream.Writable({
    write( chunk, encoding, next ){
      logger.info( chunk.toString('utf8').trim() );

      next();
    }
  })
}));

// proxy requests under /db to the CouchDB server
app.use('/db', proxy(COUCHDB_URL));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../..', 'public')));

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res) {
  res.render('index.html');
});

// development error handler
// will print stacktrace
if (NODE_ENV === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error.html');
  });
}

// production error handler
// no stacktraces leaked to user
// error page handler
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error.html');
});

app.set('port', PORT);

server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof PORT === 'string'
    ? 'Pipe ' + PORT
    : 'Port ' + PORT;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debugLog('Listening on ' + bind);
}

module.exports = app;
