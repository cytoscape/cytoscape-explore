import Express from 'express';
import uuid from 'uuid';
import Cytoscape from 'cytoscape';
import CytoscapeSyncher from '../../../model/cytoscape-syncher';
import { BASE_URL } from '../../env';
import { importCX, exportCX } from '../../../model/import-export/cx';
import { importJSON, exportJSON } from '../../../model/import-export/json';

const http = Express.Router();

const makeNetworkId = () => 'cy' + uuid();

/**
 * Post (create) a new network
 * @param {Function} importBody A function that takes (cy, body) and converts the body to cy
 * @param {Express.Request} req The HTTP request
 * @param {Express.Response} res The HTTP response
 * @param {Express.NextFunction} next The Express next(err) function
 */
const postNetwork = async (importBody, req, res, next) => {
  try {
    const body = req.body;
    const id = makeNetworkId();
    const cy = new Cytoscape();

    cy.data({ id });

    importBody(cy, body);

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
 * Get a network
 * @param {Function} exportCy A function that takes (cy) and returns the desired format
 * @param {Express.Request} req The HTTP request
 * @param {Express.Response} res The HTTP response
 * @param {Express.NextFunction} next The Express next(err) function
 */
const getNetwork = async (exportCy, req, res, next) => {
  try {
    const { id } = req.params;
    const cy = new Cytoscape();

    cy.data({ id });

    const cySyncher = new CytoscapeSyncher(cy, 'secret');

    await cySyncher.load();

    const payload = exportCy(cy);

    cySyncher.destroy();
    cy.destroy();

    res.send(payload);
  } catch(err) {
    next(err);
  }
};

/**
 * Create a new network document
 */
http.post('/', async function(req, res, next) {
  await postNetwork(importJSON, req, res, next);
});

/**
 * Get a network document
 */
http.get('/:id', async function(req, res, next){
  await getNetwork(exportJSON, req, res, next);
});

/**
 * Create a new network document from JSON format
 */
http.post('/json', async function(req, res, next) {
  await postNetwork(importJSON, req, res, next);
});

/**
 * Get a network document in JSON format
 */
http.get('/json/:id', async function(req, res, next){
  await getNetwork(exportJSON, req, res, next);
});

/**
 * Create a new network document from CX format
 */
http.post('/json', async function(req, res, next) {
  await postNetwork(importCX, req, res, next);
});

/**
 * Get a network document in CX format
 */
http.get('/json/:id', async function(req, res, next){
  await getNetwork(exportCX, req, res, next);
});

export default http;