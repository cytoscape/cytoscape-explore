import Express from 'express';
import documentRouter from './document';

const http = Express.Router();

http.use('/document', documentRouter);

export default http;