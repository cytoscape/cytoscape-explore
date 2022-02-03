import Express from 'express';
import uuid from 'uuid';
import fetch from 'node-fetch';
import { COUCHDB_URL } from '../../env';
import { SNAPSHOTS_VIEW } from '../../../model/couch-design-doc';


const createSnapshotID = () => `snapshot_${uuid()}`;
const getNetworkDocURL = (id) => `${COUCHDB_URL}/${id}/${id}`;
const getSnapshotDocURL = (id, snapID) => `${COUCHDB_URL}/${id}/${snapID}`;
const getSnapshotViewURL = (id) => `${COUCHDB_URL}/${id}/${SNAPSHOTS_VIEW}`;


async function takeSnapshot(id) {
  const snapID = createSnapshotID();
  const docURL = getNetworkDocURL(id);
  const snapURL = getSnapshotDocURL(id, snapID);

  const response = await fetch(docURL);
  if(!response.ok) {
    new Error("Cannot load network document for " + id);
  }

  const body = await response.json();
  delete body._id;
  delete body._rev;

  const putResponse = await fetch(snapURL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      snapshot: true,
      timestamp: Date.now(),
      ...body
    })
  });
  if(!putResponse.ok) {
    new Error("Cannot create snapshot document for " + id);
  }
}


async function getSnapshots(id) {
  const viewURL = getSnapshotViewURL(id);

  const response = await fetch(viewURL);
  if(!response.ok) {
    new Error("Cannot query snapshots view " + response.err);
  }
  const body = await response.json();
  const snapshots = body.rows.map(snap => ({
    id: snap.key, 
    timestamp: snap.value.timestamp 
  }));
  return snapshots;
}


async function deleteSnapshot(id, snapID) {
  const snapURL = getSnapshotDocURL(id, snapID);

  const response = await fetch(snapURL, { method: 'DELETE' });
  if(!response.ok) {
    new Error("Cannot delete snapshots view " + response.err);
  }
}


const http = Express.Router();

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
    console.log("restore???");
    res.send('ok');
  } catch (err) {
    next(err);
  }
});

export default http;