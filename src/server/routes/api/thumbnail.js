import Express from 'express';
import PouchDB  from 'pouchdb';
import Cytoscape from 'cytoscape';
import _ from 'lodash';
import VizMapper from '../../../model/vizmapper';
import { DEFAULT_NODE_STYLE, DEFAULT_EDGE_STYLE } from '../../../model/style';
import { COUCHDB_PASSWORD, COUCHDB_URL, COUCHDB_USER, USE_COUCH_AUTH } from '../../env';

// TODO Rewrite this to use 'import'
const cytosnap = require('cytosnap');
const snap = cytosnap();


function objMap(obj, f) {
  return Object.fromEntries(Object.entries(obj).map(([k,v]) => [k, f(v)]));
}


async function createThumbnail(id, width, height) {
  await snap.start();
  console.log("Cytosnap stared!");

  const db = createPouchInstance(id);
  console.log("PouchDB instance created!");

  const { elements, style } = await createCytoscapeElementsAndStyle(db, id);

  var options = {
    // cytoscape.js options
    elements, // cytoscape.js elements json
    style, // a cytoscape.js stylesheet in json format (or a function that returns it)
    layout: { name: 'preset' }, // a cytoscape.js layout options object (or a function that returns it)
    // (specifying style or layout via a function is useful in cases where you can't send properly serialisable json)
   
    // image export options
    resolvesTo: 'base64', // output, one of 'base64uri' (default), 'base64', 'stream', or 'json' (export resultant node positions from layout)
    format: 'png', // 'png' or 'jpg'/'jpeg' (n/a if resolvesTo: 'json')
    quality: 100, // quality of image if exporting jpg format, 0 (low) to 100 (high)
    background: 'transparent', // a css colour for the background (transparent by default)
    width, // the width of the image in pixels
    height // the height of the image in pixels
  };
  
  // TODO figure out how to use an image stream, shouldn't have to encode/decode base64
  return await snap.shot(options);
}


async function createCytoscapeElementsAndStyle(db, id) {
  const docs = await db.allDocs({
    include_docs: true
  });
  if(docs.total_rows === 0) {
    new Error(`The database is empty: ${id}`);
  }

  const cy = new Cytoscape();
  let elements = [];
  
  for(let i = 0; i < docs.rows.length; i++) {
    let row = docs.rows[i];
    let { doc } = row;

    if(row.id === id) {
      cy.data(_.clone(doc.data));
    } else if(row.id !== 'snapshots') { // TODO Remove the check for 'snapshots'
      elements.push({
        data: _.clone(doc.data),
        position: _.clone(doc.position),
      });
    }
  }
  if(elements.length > 0){
    cy.add(elements); 
  }

  const vizmapper = new VizMapper(cy, null);

  const _styles = cy.data('_styles') || {};
  const nodeStyleProps = Object.keys(_styles['node'] || {});
  const edgeStyleProps = Object.keys(_styles['edge'] || {});

  const style = [{
      selector: 'node',
      style: objMap(DEFAULT_NODE_STYLE, val => val.stringValue)
    },{
      selector: 'edge',
      style: objMap(DEFAULT_EDGE_STYLE, val => val.stringValue)
  }];

  cy.elements().forEach(ele => {
    const styleProps = ele.isNode() ? nodeStyleProps : edgeStyleProps;
    const elementStyle = {};
    for(const prop of styleProps) {
      elementStyle[prop] = vizmapper.calculate(ele, prop);
    }
    style.push({
      selector: "#" + ele.id(),
      style: elementStyle
    });
  });

  return { elements, style };
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
