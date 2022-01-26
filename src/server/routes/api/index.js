import Express from 'express';
import documentRouter from './document';
import historyRouter from './history';
import thumbnailRouter from './thumbnail';

const http = Express.Router();

http.use('/document', documentRouter);
http.use('/history', historyRouter);
http.use('/thumbnail', thumbnailRouter);

export default http;