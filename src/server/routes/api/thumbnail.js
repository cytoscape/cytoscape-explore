import Express from 'express';
import PouchDB  from 'pouchdb';
import _ from 'lodash';
import { COUCHDB_PASSWORD, COUCHDB_URL, COUCHDB_USER, USE_COUCH_AUTH } from '../../env';


// TODO Rewrite this to use 'import'
const cytosnap = require('cytosnap');
const snap = cytosnap();

async function createThumbnail(id, width, height) {
  await snap.start();
  console.log("Cytosnap stared!");

  const db = createPouchInstance(id);
  console.log("PouchDB instance created!");

  const elements = await createCytoscapeElementsJSON(db, id);

  var options = {
    // cytoscape.js options
    elements, // cytoscape.js elements json
    //style: undefined, // a cytoscape.js stylesheet in json format (or a function that returns it)
    layout: { name: 'preset' }, // a cytoscape.js layout options object (or a function that returns it)
    // (specifying style or layout via a function is useful in cases where you can't send properly serialisable json)
   
    // image export options
    resolvesTo: 'base64', // output, one of 'base64uri' (default), 'base64', 'stream', or 'json' (export resultant node positions from layout)
    format: 'png', // 'png' or 'jpg'/'jpeg' (n/a if resolvesTo: 'json')
    quality: 85, // quality of image if exporting jpg format, 0 (low) to 100 (high)
    background: 'transparent', // a css colour for the background (transparent by default)
    width, // the width of the image in pixels
    height // the height of the image in pixels
  };
  
  // TODO figure out how to use an image stream, shouldn't have to encode/decode base64
  const image = await snap.shot(options);
  return image;
}


async function createCytoscapeElementsJSON(db, id) {
  const docs = await db.allDocs({
    include_docs: true
  });
  console.log("Docs retreived!");

  if(docs.total_rows === 0) {
    new Error(`The database is empty: ${id}`);
  }

  let eleJsons = [];
  let styleJson = []; // TODO ???

  for(let i = 0; i < docs.rows.length; i++) {
    let row = docs.rows[i];
    let { doc } = row;

    if(row.id === id){
      // TODO get the style
    } else if(row.id !== 'snapshots') { // TODO Remove the check for 'snapshots'
      eleJsons.push({
        data: _.clone(doc.data),
        position: _.clone(doc.position),
      });
    }
  }

  return eleJsons;
}


// TODO When/if the database format changes to store the entire network in a single 
// document, then we can just use fetch and the couch http API to get the document. 
// For now using Pouch is more convenient because it automatically starts a replication 
// that pulls in a consistent snapshot of the network at the time the replication starts.
function createPouchInstance(id) {
  let options = {};
  if (USE_COUCH_AUTH) {
    options.auth = {
      username: COUCHDB_USER,
      password: COUCHDB_PASSWORD
    };
  }
  return new PouchDB(`${COUCHDB_URL}/${id}`, options);
}



const http = Express.Router();

http.get('/:id', async function(req, res, next) {
  try {
    const { id } = req.params;
    const { w = 400, h = 300 } = req.query || {};

    const imageEncoded = await createThumbnail(id, +w, +h);
    const image = Buffer.from(imageEncoded, 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': image.length
    });
    res.end(image);

  } catch (err) {
    next(err);
  }
});

export default http;
