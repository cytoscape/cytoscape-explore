import Express from 'express';
import documentRouter from './document';
import ndexRouter from './ndex';

const http = Express.Router();

http.use('/document', documentRouter);
http.use('/ndex', ndexRouter);

export default http;