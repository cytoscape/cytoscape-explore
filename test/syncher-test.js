import Cytoscape from 'cytoscape';
import { expect } from 'chai';
import { CytoscapeSyncher } from '../src/model/cytoscape-syncher';
import fetch from 'node-fetch';

global.fetch = fetch; // so that the syncher has access to global `fetch()` like the browser does

const PORT = process.env.PORT;

const delay = (duration = 100) => new Promise((resolve) => {
  setTimeout(resolve, duration);
});

const on = (evt, target) => new Promise(resolve => {
  target.on(evt, resolve);
});

describe('CytoscapeSyncher', function() {
  let cy, syncher; // instances for simualted client1
  let cy2, syncher2; // instances for simulated client2
  let id = 'test'; // test network id
  let secret = 'secret';
  let defSyncInt;

  this.timeout(10000);

  beforeEach(async () => {
    defSyncInt = CytoscapeSyncher.synchInterval;
  
    CytoscapeSyncher.synchInterval = 16; // faster for testing

    cy = new Cytoscape({
      headless: true,
      styleEnabled: true
    });

    cy.data({ id });

    cy2 = new Cytoscape({
      headless: true,
      styleEnabled: true
    });

    cy2.data({ id });

    await delay();
  });

  afterEach(async () => {
    cy.destroy();
    cy2.destroy();

    CytoscapeSyncher.synchInterval = defSyncInt;
  });

  const itPassesCommonSyncTests = () => {
    it('client1 adds a node, client2 sees the edit', async () => {
      cy.add({ data: { id: 'foo2', bar: 'baz2' } });
  
      await cy2.pon('add');
  
      let node = cy2.nodes().last();
  
      expect(node.nonempty()).to.be.true;
      expect(node.id()).to.equal('foo2');
      expect(node.data('bar')).to.equal('baz2');
    });

    it('client1 adds then removes a node, client2 sees the edits', async () => {
      cy.add({ data: { id: 'foo2', bar: 'baz2' } });
  
      await cy2.pon('add');
  
      let node = cy2.nodes().last();
  
      expect(node.nonempty()).to.be.true;
      expect(node.id()).to.equal('foo2');
      expect(node.data('bar')).to.equal('baz2');

      cy.$('#foo2').remove();

      await cy2.pon('remove');

      expect(cy2.nodes('#foo2').empty()).to.be.true;
    });

    it('client1 adds then repositions a node, client2 sees the edits', async () => {
      cy.add({ data: { id: 'foo2', bar: 'baz2' } });
  
      await cy2.pon('add');
  
      let node = cy2.nodes().last();
  
      expect(node.nonempty()).to.be.true;
      expect(node.id()).to.equal('foo2');
      expect(node.data('bar')).to.equal('baz2');

      cy.$('#foo2').position({ x: 123, y: 456 });

      await cy2.$('#foo2').pon('position');

      expect(cy2.$('#foo2').position()).to.deep.equal({ x: 123, y: 456 });
    });

    it('client1 adds a node then changes its data, client2 sees the edits', async () => {
      cy.add({ data: { id: 'foo2', bar: 'baz2' } });
  
      await cy2.pon('add');
  
      let node = cy2.nodes().last();
  
      expect(node.nonempty()).to.be.true;
      expect(node.id()).to.equal('foo2');
      expect(node.data('bar')).to.equal('baz2');

      cy.$('#foo2').data({ bar: 'newval' });

      await cy2.$('#foo2').pon('data');

      expect(cy2.$('#foo2').data('bar')).to.equal('newval');
    });

    it('client1 adds a node then selects it, client2 selection unchanged', async () => {
      cy.add({ data: { id: 'foo2', bar: 'baz2' } });
  
      await cy2.pon('add');
  
      let node = cy2.nodes().last();
  
      expect(node.nonempty()).to.be.true;
      expect(node.id()).to.equal('foo2');
      expect(node.data('bar')).to.equal('baz2');

      cy.$('#foo2').select();

      await delay(500); // ample time to wait for potential select event

      expect(cy2.$('#foo2').selected()).to.be.false; // selection should not carry over to a different client
    });
  };

  describe('on server, two instances', () => {
    beforeEach(async () => {
      syncher = new CytoscapeSyncher(cy, secret);
      syncher2 = new CytoscapeSyncher(cy2, secret);
    });
  
    afterEach(async () => {
      await syncher.delete();
  

      syncher.destroy();
      syncher2.destroy();
    });

    describe('crud ops', () => {
      it('client1 creates a doc, client2 loads it', async () => {
        cy.add({ data: { id: 'foo', bar: 'baz' } });
    
        await syncher.create();
    
        await syncher2.load();
    
        let node = cy2.nodes().first();
    
        expect(node.nonempty()).to.be.true;
        expect(node.id()).to.equal('foo');
        expect(node.data('bar')).to.equal('baz');
      });
    });
  
    describe('sync ops', () => {
      beforeEach(async () => {
        await syncher.create();
        await syncher2.load();
    
        await syncher.enable();
        await syncher2.enable();
      });

      itPassesCommonSyncTests();
    });
  });

  describe('on two clients through proxy server', () => {
    const serverOrigin = `http://localhost:${PORT}`;

    beforeEach(async () => {
      const res = await fetch(`${serverOrigin}/api/document`, {
        method: 'POST',
        body: JSON.stringify({
          elements: [
            { data: { id: 'foo', bar: 'baz' } }
          ]
        }),
        headers: {'Content-Type': 'application/json'}
      });

      const resJson = await res.json();

      id = resJson.id;
      secret = resJson.secret;

      cy.data({ id });
      cy2.data({ id });

      syncher = new CytoscapeSyncher(cy, secret, false, serverOrigin);
      syncher2 = new CytoscapeSyncher(cy2, secret, false, serverOrigin);
    });
  
    afterEach(async () => {
      await syncher.delete();
  
      syncher.destroy();
      syncher2.destroy();
    });

    describe('crud ops', () => {
      it('client2 loads existing doc', async () => {
        await syncher2.load();
    
        let node = cy2.nodes().first();
    
        expect(node.nonempty()).to.be.true;
        expect(node.id()).to.equal('foo');
        expect(node.data('bar')).to.equal('baz');
      });
    });

    describe('sync ops', () => {
      beforeEach(async () => {
        await syncher.load();
        await syncher2.load();
    
        await syncher.enable();
        await syncher2.enable();
      });

      itPassesCommonSyncTests();
    });
  });
});
