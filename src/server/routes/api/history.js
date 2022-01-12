import Express from 'express';
import uuid from 'uuid';
import fetch from 'node-fetch';

import { COUCHDB_PASSWORD, COUCHDB_URL, COUCHDB_USER, USE_COUCH_AUTH } from '../../env';

const http = Express.Router();

function createSnapshotID(id) {
  return `${id}_${uuid()}_snapshot`;
}

function getSnapshotDocURL(id) {
  return `${COUCHDB_URL}/${id}/snapshots`; // a _local document does not get replicated
}

async function updateSnapshotsDocument(id, snapID) {
  const docURL = getSnapshotDocURL(id);
  const newSnap = { id: snapID, timestamp: Date.now() } ;

  const response = await fetch(docURL);
  if(response.status === 404) {
    console.log("shapshots document is being created");
    fetch(docURL, {
      method: 'PUT',
      body: JSON.stringify({
        snapshots: [ newSnap ]
      })
    });
  } else {
    console.log("shapshots document is being updated");
    const body = await response.json();
    fetch(docURL, {
      method: 'PUT',
      body: JSON.stringify({
        _rev: body._rev,
        snapshots: [ newSnap, ...body.snapshots ],
      })
    });
  }
}


async function getSnapshots(req, res, next) {
  try {
    const { id } = req.params; // id of source network
    const docURL = getSnapshotDocURL(id);
    const response = await fetch(docURL);
    if(response.status === 404) {
      res.send(JSON.stringify([]));
    } else {
      const body = await response.json();
      res.send(JSON.stringify(body.snapshots));
    }
  } catch(err) {
    next(err);
  }
}


async function takeSnapshot(req, res, next) {
  try {
    const { id } = req.params; // id of source network
    const snapID = createSnapshotID(id);

    updateSnapshotsDocument(id, snapID);

    const response = await fetch(`${COUCHDB_URL}/_replicate`, {
      method: 'POST',
      body: JSON.stringify({
        source: `${COUCHDB_URL}/${id}`,
        target: `${COUCHDB_URL}/${snapID}`,
        create_target: true,
      }),
    });

    // MKTODO how to deal with results??? How should the client deal with it?
    // Should we check if there is currently a replication of source taking place, and respond to the client that its in progress.
    // Should the client show a progress bar??
    // Should the progress bar be in the history panel??

    res.send('ok');

  } catch(err) {
    next(err);
  }
}


http.post('/snapshot/:id', async function(req, res, next) {
  await takeSnapshot(req, res, next);
});

http.get('/snapshots/:id', async function(req, res, next) {
  await getSnapshots(req, res, next);
});

export default http;