import Express from 'express';
import uuid from 'uuid';
import Cytoscape from 'cytoscape';
import CytoscapeSyncher from '../../../model/cytoscape-syncher';
import { BASE_URL } from '../../env';
import { importJSON } from '../../../model/import-export/json';

const http = Express.Router();

const makeNetworkId = () => 'cy' + uuid();

/**
 * Post (create) a new network
 * @param {Function} importBody A function that takes (cy, body) and converts the body to cy
 * @param {Express.Request} req The HTTP request
 * @param {Express.Response} res The HTTP response
 * @param {Express.NextFunction} next The Express next(err) function
 */
const importNDExNetwork = async (importBody, req, res, next) => {
  try {
    const body = req.body;
    const id = makeNetworkId();
    const cy = new Cytoscape();

    importBody(cy, body);
    cy.data({ id });

    const cySyncher = new CytoscapeSyncher(cy, 'secret');

    await cySyncher.create();

    cySyncher.destroy();
    cy.destroy();

    res.send({
      id,
      url: `${BASE_URL}/document/${id}`
    });
  } catch(err) {
    next(err);
  }
};

/**
 * Create a new network document
 */
http.post('/import', async function(req, res, next) {
  await importNDExNetwork(importJSON, req, res, next);
});


export default http;
