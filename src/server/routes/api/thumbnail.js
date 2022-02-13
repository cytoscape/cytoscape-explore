import Express from 'express';
import Cytoscape from 'cytoscape';
import VizMapper from '../../../model/vizmapper';
import { DEFAULT_NODE_STYLE, DEFAULT_EDGE_STYLE } from '../../../model/style';
import fetch from 'node-fetch';
import { getNetworkDocURL, getSnapshotDocURL, removeQuotes } from './history';

// TODO Rewrite this to use 'import'
const cytosnap = require('cytosnap');

console.log("Cytosnap stared!");

function objMap(obj, f) {
  return Object.fromEntries(Object.entries(obj).map(([k,v]) => [k, f(v)]));
}

async function getThumbnail(id, snapID, width, height) {
  // If its a thumbnail of the live network document then just create and return it.
  if(!snapID) {
    console.log("no snapID, generating thumbnail for network doc");
    const docURL = getNetworkDocURL(id);
    const { image } = await createThumbnail(docURL, width, height);
    return image;
  }

  // If its a thumbnail of a snapshot, then we can cache it as an attachment on the snapshot document.
  const docURL = getSnapshotDocURL(id, snapID);

  // Check if there's already a thumbnail attached to the snapshot document.
  // TODO What if the width/height is different?????
  const getRes = await fetch(`${docURL}/network.png`);
  if(getRes.status === 200) {
    const image = await getRes.text(); // base64
    return image;
  }

  const { image, rev } = await createThumbnail(docURL, width, height);

  // Save the attachment
  await fetch(`${docURL}/network.png`, { 
    method: 'PUT',
    headers: { 
      'Content-Type': 'image/png',
      'If-Match': rev
    },
    body: image
  });

  return image;
}


async function createThumbnail(docURL, width, height) {
  const response = await fetch(docURL);
  if(!response.ok) {
    throw new Error(`Cannot fetch network document: ${docURL}`);
  }
  const rev = removeQuotes(response.headers.get('ETag'));

  const json = await response.json();
  const { elements, style } = await createCytoscapeElementsAndStyle(json);
  const image = await runCytosnap(elements, style, width, height);

  return { image, rev };
}


async function runCytosnap(elements, style, width, height) {
  const snap = cytosnap();
  await snap.start();

  const options = {
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
  const image = await snap.shot(options);
  return image;
}


async function createCytoscapeElementsAndStyle(json) {
  const cy = new Cytoscape();
  if(json.data)
    cy.data(json.data); 
  if(json.elements)
    cy.add(json.elements); 

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

  return { elements: json.elements, style };
}




const http = Express.Router();

http.get('/:id', async function(req, res, next) {
  try {
    const { id } = req.params;
    const { w = 400, h = 300 } = req.query || {};
    const snapID = req.query && req.query.snapshot;

    const imageEncoded = await getThumbnail(id, snapID, +w, +h);
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
