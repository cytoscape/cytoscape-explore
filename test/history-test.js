import { expect } from 'chai';
import fetch from 'node-fetch';
import Cytoscape from 'cytoscape';
import { CytoscapeSyncher } from '../src/model/cytoscape-syncher';
import { PORT, COUCHDB_URL } from '../src/server/env';

const SERVER = `http://localhost:${PORT}`;

describe('History (Snapshots)', () => {

  const id = 'history_test';
  let syncher;

  beforeEach('create fixture', async () => {
    const cy = new Cytoscape({
      headless: true,
      styleEnabled: true,
      elements: [
        // nodes
        { data: { id: 'a', attr1: 'asdf' }},
        { data: { id: 'b', attr1: 'bsdf' }},
        { data: { id: 'c', attr1: 'csdf' }},
        // edges
        { data: { id: 'ab', source: 'a', target: 'b', eattr1: 'asdf' }}
      ]
    });

    cy.data({ id });

    // This creates the network database with the network document and design document.
    syncher = new CytoscapeSyncher(cy, 'secret');
    await syncher.create();
  });

  afterEach(async () => {
    await syncher.delete();
    syncher.destroy();
  });

  
  it('creates and lists snapshots', async () => {
    // should be 0 snapshots
    const res1 = await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'GET' });
    const snapshots1 = await res1.json();
    expect(snapshots1).to.eql([]);

    // Take a snapshot, should be 1 snapshot now
    const res2 = await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });
    const snapshots2 = await res2.json();
    expect(snapshots2.length).to.eql(1);
    const snap = snapshots2[0];
    expect(snap.id).to.satisfy(id => id.startsWith('snapshot'));

    // Take more snapshots
    await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });
    await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });

    // should be 3 snapshots
    const res3 = await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'GET' });
    const snapshots3 = await res3.json();
    expect(snapshots3.length).to.eql(3);
  });


  it('deletes snapshots', async () => {
    // Take some snapshots
    await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });
    await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });
    await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });
    await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });
    await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });

    // should be 5 snapshots
    const res1 = await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'GET' });
    const snapshots1 = await res1.json();
    expect(snapshots1.length).to.eql(5);

    // delete a snapshot
    const res2 = await fetch(`${SERVER}/api/history/snapshot/${id}/${snapshots1[0].id}`, { method: 'DELETE' });
    const snapshots2 = await res2.json();
    expect(snapshots2.length).to.eql(4);

    // delete another snapshot
    const res3 = await fetch(`${SERVER}/api/history/snapshot/${id}/${snapshots1[1].id}`, { method: 'DELETE' });
    const snapshots3 = await res3.json();
    expect(snapshots3.length).to.eql(3);
    const ids = snapshots3.map(obj => obj.id);
    expect(ids).to.not.include(snapshots1[0].id);
    expect(ids).to.not.include(snapshots1[1].id);
    expect(ids).to.include(snapshots1[2].id);
    expect(ids).to.include(snapshots1[3].id);
    expect(ids).to.include(snapshots1[4].id);
  });


  it('restores snapshots', async () => {
    // Take a snapshot
    const res1 = await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });
    const snapshots1 = await res1.json();
    const snapID1 = snapshots1[0].id;

    // Check the snapshot has correct number of elements.
    const res2 = await fetch(`${COUCHDB_URL}/${id}/${snapID1}`);
    const snapNet1 = await res2.json();
    expect(snapNet1.elements.length).to.eql(4);

    // Add a node to the network (do this manually, this is not a test for CytoscapeSyncher)
    const docURL = `${COUCHDB_URL}/${id}/${id}`;

    const res3 = await fetch(docURL);
    const network1 = await res3.json();
    const elements = network1.elements;
    elements.push({ data: { id: 'foo', bar: 'baz' } });

    await fetch(docURL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _rev: network1._rev,
        data: network1.data,
        elements: elements ,
      })
    });

    // Take another snapshot
    const res4 = await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });
    const snapshots2 = await res4.json();
    const snapID2 = snapshots2.filter(snap => snap.id !== snapID1)[0].id;
    
    // Check the second snapshot has correct number of elements.
    const res5 = await fetch(`${COUCHDB_URL}/${id}/${snapID2}`);
    const snapNet2 = await res5.json();
    expect(snapNet2.elements.length).to.eql(5); 

    // Restore the first snapshot (this will take another snapshot as well)
    const res6 = await fetch(`${SERVER}/api/history/restore/${id}/${snapID1}`, { method: 'POST' });
    const snapshots3 = await res6.json();
    expect(snapshots3.length).to.eql(3); // should be 3 snapshots now

    // Check that the first snapshot was restored (just check the number of elements is correct)
    const res7 = await fetch(docURL);
    const network2 = await res7.json();
    expect(network2.elements.length).to.eql(4); // back to 4 elements
  });


  // it('handles errors', async () => {
  //   const res1 = await fetch(`${SERVER}/api/history/snapshot/bogus_id`, { method: 'GET' });
  //   expect(res1.ok).to.be.false;

  //   const res2 = await fetch(`${SERVER}/api/history/snapshot/bogus_id`, { method: 'POST' });
  //   expect(res2.ok).to.be.false;

  //   const res3 = await fetch(`${SERVER}/api/history/snapshot/bogus_id/bogus_id`, { method: 'DELETE' });
  //   expect(res3.ok).to.be.false;

  //   const res4 = await fetch(`${SERVER}/api/history/restore/bogus_id/bogus_id`, { method: 'POST' });
  //   expect(res4.ok).to.be.false;
  // });


  it('creates thumbnails', async () => {
    // Take a snapshot
    const res1 = await fetch(`${SERVER}/api/history/snapshot/${id}`, { method: 'POST' });
    const snapshots1 = await res1.json();
    const snapID = snapshots1[0].id;

    // Create a thumbnail
    const res2 = await fetch(`${SERVER}/api/thumbnail/${id}?snapshot=${snapID}`, { method: 'GET' });
    expect(res2.ok).to.be.true;
    const type = res2.headers.get('content-type');
    expect(type).to.eql('image/png');
  }).timeout(15000);

});