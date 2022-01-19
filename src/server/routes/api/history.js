import Express from 'express';
import uuid from 'uuid';
import fetch from 'node-fetch';
import { COUCHDB_URL } from '../../env';


function createSnapshotID(id) {
  return `${id}_${uuid()}_snapshot`;
}

function getSnapshotDocURL(id) {
  return `${COUCHDB_URL}/${id}/snapshots`; // a _local document does not get replicated
}


async function getSnapshots(id) {
  const docURL = getSnapshotDocURL(id);
  const response = await fetch(docURL);
  if(response.status === 404) {
    return [];
  } else {
    const body = await response.json();
    return body.snapshots;
  }
}


async function updateSnapshotsDocument(id, snapID) {
  const newSnap = { id: snapID, timestamp: Date.now() } ;

  const docURL = getSnapshotDocURL(id);
  const response = await fetch(docURL);

  if(response.status === 404) {
    console.log("shapshots document needs to be created");
    const putResponse = await fetch(docURL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snapshots: [ newSnap ]
      })
    });
    if(!putResponse.ok) {
      new Error(`Cannot create snapshots document for ${id}: ${putResponse.err}`);
    }
  } else if(response.ok) {
    console.log("shapshots document is being updated");
    const body = await response.json();
    const putResponse = await fetch(docURL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _rev: body._rev,
        snapshots: [ newSnap, ...body.snapshots ],
      })
    });
    if(!putResponse.ok) {
      new Error(`Cannot update snapshots document for ${id}: ${putResponse.err}`);
    }
  } else {
    new Error(`Cannot fetch snapshots document for ${id}: ${response.err}`);
  }
}


async function deleteSnapshotFromDocument(id, snapID) {
  const docURL = getSnapshotDocURL(id);
  const response = await fetch(docURL);
  if(!response.ok) {
    new Error(`Cannot update snapshots document for ${id}: ${response.err}`);
  }

  const body = await response.json();
  const snapshots = body.snapshots.filter(snap => snap.id != snapID);

  const putResponse = await fetch(docURL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      _rev: body._rev,
      snapshots
    })
  });
  if(!putResponse.ok) {
    new Error(`Cannot update snapshots document for ${id}: ${putResponse.err}`);
  }
}


async function createSnapshotDatabase(id, snapID) {
  const response = await fetch(`${COUCHDB_URL}/_replicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: `${COUCHDB_URL}/${id}`,
      target: `${COUCHDB_URL}/${snapID}`,
      create_target: true,
    }),
  });
  if(!response.ok) {
    new Error(`Error creating snapshot replica database. Network:${id}, Snapshot:${snapID}`);
  }
}


async function deleteSnapshotDatabase(snapID) {
  const response = await fetch(`${COUCHDB_URL}/${snapID}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if(!response.ok) {
    new Error(`Error deleting snapshot database: ${snapID}, ${response.err}`);
  }
}


async function deleteSnapshot(id, snapID) {
  await deleteSnapshotDatabase(snapID);
  await deleteSnapshotFromDocument(id, snapID);
}

async function takeSnapshot(id) {  // id of source network
  const snapID = createSnapshotID(id);
  await createSnapshotDatabase(id, snapID);
  await updateSnapshotsDocument(id, snapID);
}



const http = Express.Router();

// Note, this endpoint isn't needed by the UI because PouchDB will 
// automatically sync the 'snapshots' document to the client.
// Its just here for completeness and debugging.
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
    res.send('ok');
  } catch (err) {
    next(err);
  }
});

http.delete('/snapshot/:id/:snapID', async function(req, res, next) {
  try {
    const { id, snapID } = req.params;
    await deleteSnapshot(id, snapID);
    res.send('ok');
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