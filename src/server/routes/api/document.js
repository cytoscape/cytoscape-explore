import Express from 'express';
import uuid from 'uuid';
import Cytoscape from 'cytoscape';
import CytoscapeSyncher from '../../../model/cytoscape-syncher';
import ndexClient from '@js4cytoscape/ndex-client';
import PouchDB  from 'pouchdb';

import { BASE_URL, NDEX_API_URL } from '../../env';
import { COUCHDB_PASSWORD, COUCHDB_URL, COUCHDB_USER, USE_COUCH_AUTH } from '../../env';
import { importCX, exportCX } from '../../../model/import-export/cx';
import { importJSON, exportJSON } from '../../../model/import-export/json';

const http = Express.Router();

const makeNetworkId = () => 'cy' + uuid();

/**
 * Post (create) a new network from CX1 JSON
 * The way this function differs from postNetwork
 * is that the cySyncher is created before the `importBody` function
 * is called.  This is because the importCX function depends on the
 * cy.vizmapper() being available which depends on the CytoscapeSyncher
 * being initialized.
 *
**/
 const postCX2Network = async (importBody, req, res, next) => {
  try {
    const body = req.body;
    const id = makeNetworkId();
    const cy = new Cytoscape();
    const secret = uuid();
    const publicUrl = `${BASE_URL}/document/${id}`;
    const privateUrl = `${publicUrl}/${secret}`;

    cy.data({ id });
    const cySyncher = new CytoscapeSyncher(cy, secret);
    importBody(cy, body);

    await cySyncher.create();

    cySyncher.destroy();
    cy.destroy();

    res.send({ id, secret, url: privateUrl, privateUrl, publicUrl });
  } catch(err) {
    next(err);
  }
};

const setSecret = async (id, secret) => {
  let options = {};

    if (USE_COUCH_AUTH) {
      options.auth = {
        username: COUCHDB_USER,
        password: COUCHDB_PASSWORD
      };
    }
    
    const secretsDb = new PouchDB(`${COUCHDB_URL}/secrets`, options);

    await secretsDb.put({ _id: id, secret: secret });
};

export const createDemo = async () => {
  try {
    const id = 'demo';
    const secret = 'demo';
    const cy = new Cytoscape();

    cy.data({ id });

    const cySyncher = new CytoscapeSyncher(cy, secret);

    await cySyncher.create();

    cySyncher.destroy();
    cy.destroy();

    await setSecret(id, secret);
  } catch (err) {
    // demo probably already exists then
  }
};

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
    const secret = uuid();
    const publicUrl = `${BASE_URL}/document/${id}`;
    const privateUrl = `${publicUrl}/${secret}`;

    importBody(cy, body);
    cy.data({ id });

    const cySyncher = new CytoscapeSyncher(cy, secret);

    await cySyncher.create();

    cySyncher.destroy();
    cy.destroy();

    await setSecret(id, secret);

    res.send({ id, secret, url: privateUrl, privateUrl, publicUrl });
  } catch(err) {
    next(err);
  }
};

const exportNetworkToNDEx = async (req, res, next) => {
  try {
    const { id, authToken, makePublic } = req.body;
    const cy = new Cytoscape();

    cy.data({ id });

    const cySyncher = new CytoscapeSyncher(cy);

    await cySyncher.load();

    const cx2 = exportCX(cy);

    cySyncher.destroy();
    cy.destroy();

    const ndex0 = new ndexClient.NDEx(NDEX_API_URL);
    ndex0.setAuthToken(authToken);
    const ndexUrl = new URL(NDEX_API_URL).origin;
    const { uuid } = await ndex0.createNetworkFromRawCX2(cx2, makePublic);
    const ndexNetworkURL = new URL(`viewer/networks/${uuid}`, ndexUrl).href;
    res.send({ uuid, ndexNetworkURL });
  } catch (err) {
    next(err);
  }
};

const importNDExNetworkById = async (req, res, next) => {
  try {
    const { ndexUUID, authToken } = req.body;

    const ndex0 = new ndexClient.NDEx(NDEX_API_URL);
    authToken != null ? ndex0.setAuthToken(authToken) : null;

    const rawcx2 = await ndex0.getCX2Network(ndexUUID);

    req.body = rawcx2;

    let response = await postCX2Network(importCX, req, res, next);
    res.send(response);
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

    const cySyncher = new CytoscapeSyncher(cy);

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
 * Create a new network from CX
 */
 http.post('/cx', async function(req, res, next) {
  await postCX2Network(importCX, req, res, next);
});

/**
 * Get a network document in CX format
 */
http.get('/cx/:id', async function(req, res, next){
  await getNetwork(exportCX, req, res, next);
});

/**
 * Import a CX network from NDEx by NDEx UUID
 */
http.post('/cx-import', async function(req, res, next) {
  await importNDExNetworkById(req, res, next);
});

/**
 * Export a Cytoscape Explore network to NDEx by Cytoscape Explore UUID
 */
http.post('/cx-export', async function(req, res, next){
  // await getNetwork(exportCX, req, res, next);
  // get cytoscape explore id
  // send back ndex id
  await exportNetworkToNDEx(req, res, next);
});

export default http;
