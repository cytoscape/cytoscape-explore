import Express from 'express';
import uuid from 'uuid';
import fetch from 'node-fetch';
import { COUCHDB_URL } from '../../env';
import { SNAPSHOTS_VIEW } from '../../../model/couch-design-doc';


export const createSnapshotID = () => `snapshot_${uuid()}`;
export const getNetworkDocURL = (id) => `${COUCHDB_URL}/${id}/${id}`;
export const getSnapshotDocURL = (id, snapID) => `${COUCHDB_URL}/${id}/${snapID}`;
export const getSnapshotViewURL = (id) => `${COUCHDB_URL}/${id}/${SNAPSHOTS_VIEW}`;

export const removeQuotes = str => {
  if(str.charAt(0) === '"' && str.charAt(str.length-1) === '"')
    return str.substr(1, str.length-2);
  return str;
};


async function takeSnapshot(id) {
  const snapID = createSnapshotID();
  const docURL = getNetworkDocURL(id);
  const snapURL = getSnapshotDocURL(id, snapID);

  // Fetch the current rev of the network document.
  const response = await fetch(docURL);
  if(!response.ok) {
    new Error("Cannot load network document for " + id);
  }
  const body = await response.json();

  // Create a snapshot document that is a copy of the network document.
  const putResponse = await fetch(snapURL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      snapshot: true,
      timestamp: Date.now(),
      data: body.data,
      elements: body.elements,
    })
  });
  if(!putResponse.ok) {
    new Error("Cannot create snapshot document for " + id);
  }
}


async function getSnapshots(id) {
  const viewURL = getSnapshotViewURL(id);

  // Call the snapshots view, this is like a query that returns a list of all the snapshots.
  const response = await fetch(viewURL);
  if(!response.ok) {
    new Error("Cannot query snapshots view " + response.err);
  }
  const body = await response.json();

  // Reformat the data a bit.
  const snapshots = body.rows.map(snap => ({
    id: snap.key, 
    timestamp: snap.value.timestamp 
  }));
  return snapshots;
}


async function deleteSnapshot(id, snapID) {
  const snapURL = getSnapshotDocURL(id, snapID);

  // Get the rev of the snapshot document
  const headRes = await fetch(snapURL, { method: 'HEAD' });
  if(!headRes.ok) {
    new Error("Cannot get rev for snapshot document " + headRes.err);
  }
  const rev = removeQuotes(headRes.headers.get('ETag'));

  // Delete the snapshot document, must supply the rev
  const response = await fetch(`${snapURL}?rev=${rev}`, { method: 'DELETE' });
  if(!response.ok) {
    new Error("Cannot delete snapshots view " + response.err);
  }
}


async function restoreSnapshot(id, snapID) {
  const docURL = getNetworkDocURL(id);
  const snapURL = getSnapshotDocURL(id, snapID);

  // Get the current rev of the network document.
  const headRes = await fetch(docURL, { method: 'HEAD' });
  if(!headRes.ok) {
    new Error("Cannot get rev for network document " + headRes.err);
  }
  const rev = removeQuotes(headRes.headers.get('ETag'));

  // Get the entire snapshot document.
  const snapRes = await fetch(snapURL, { method: 'GET' });
  if(!snapRes.ok) {
    new Error("Cannot get snapshot document " + snapRes.err);
  }
  const snapshot = await snapRes.json();

  // Overwrite the network doucment with the contents of the snapshot.
  const putResponse = await fetch(docURL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      _rev: rev,
      restoredFromSnapshot: true, // This flag tells the client that 'fit content' should be called.
      data: snapshot.data,
      elements: snapshot.elements,
    })
  });
  if(!putResponse.ok) {
    new Error("Cannot restore snapshot document for " + id);
  }
}



const http = Express.Router();
// All the endpoints return the list of snapshots.

http.get('/snapshot/:id', async function(req, res, next) {
  try {
    const { id } = req.params;
    const snapshots = await getSnapshots(id);
    res.send(JSON.stringify(snapshots));
  } catch (err) {
    next(err);
  }
});

http.post('/snapshot/:id', async function(req, res, next) {
  try {
    const { id } = req.params;
    await takeSnapshot(id);
    const snapshots = await getSnapshots(id);
    res.send(JSON.stringify(snapshots));
  } catch (err) {
    next(err);
  }
});

http.delete('/snapshot/:id/:snapID', async function(req, res, next) {
  try {
    const { id, snapID } = req.params;
    await deleteSnapshot(id, snapID);
    const snapshots = await getSnapshots(id);
    res.send(JSON.stringify(snapshots));
  } catch (err) {
    next(err);
  }
});

http.post('/restore/:id/:snapID', async function(req, res, next) {
  try {
    const { id, snapID } = req.params;
    // Take a new snapshot of the current network before restoring the given snapshot.
    // This is to prevent the user from accidentailly losing their work, without prompting with a confirm dialog.
    await takeSnapshot(id);
    await restoreSnapshot(id, snapID);
    const snapshots = await getSnapshots(id);
    res.send(JSON.stringify(snapshots));
  } catch (err) {
    next(err);
  }
});

export default http;