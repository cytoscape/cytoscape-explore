import { expect } from 'chai';
import Cytoscape from 'cytoscape';
import EventEmitter from 'eventemitter3';
import { NetworkAnalyser } from '../src/client/components/network-editor/network-analyser';


describe('Network Analyser', () => {
  /** @type {Cytoscape.Core} */
  let cy;
  /** @type {NetworkAnalyser} */
  let analyser;
  /** @type {EventEmitter} */
  let bus;

  beforeEach('create fixture', () => {
    cy = new Cytoscape({
      headless: true,
      styleEnabled: true,
      elements: [
        // nodes
        { data: { 
          id: 'a', 
          attr1: 'asdf',
          attr2: 1.0 
        }},
        { data: { 
          id: 'b',
          attr1: 'bsdf',
          attr3: 'blah'
        }},
        // edges
        { data: { 
          id: 'ab', 
          source: 'a', 
          target: 'b',
          eattr1: 'asdf',
          eattr2: 99
        }}
      ]
    });

    bus = new EventEmitter();
    analyser = new NetworkAnalyser(cy, bus);
  });

  it('intialized correctly', () => {
    expect( analyser.getCount('node') ).to.equal( 2 );
    expect( analyser.getCount('edge') ).to.equal( 1 );
    expect( analyser.getAttributes('node') ).to.eql( ['attr1', 'attr2', 'attr3']);
    expect( analyser.getAttributes('edge') ).to.eql( ['eattr1', 'eattr2']);
  });

  it('add a node and an edge', () => {
    cy.add({ data: { id: 'c' } });
    cy.add({ data: { id: 'ac', source: 'a', target: 'c' } });
    expect( analyser.getCount('node') ).to.equal( 3 );
    expect( analyser.getCount('edge') ).to.equal( 2 );
  });

});

