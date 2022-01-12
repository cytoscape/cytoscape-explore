import Express from 'express';
import documentRouter from './document';
import historyRouter from './history';

const http = Express.Router();

http.use('/document', documentRouter);
http.use('/history', historyRouter);

export default http;