import { expect } from 'chai';
import Cytoscape from 'cytoscape';
import EventEmitter from 'eventemitter3';
import { NetworkAnalyser, ATTR_TYPE } from '../src/client/components/network-editor/network-analyser';


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
        { data: { 
          id: 'c',
          attr1: 'csdf',
          attr3:  99
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
    expect( analyser.getCount('node') ).to.equal( 3 );
    expect( analyser.getCount('edge') ).to.equal( 1 );

    expect( analyser.getAttributes('node') ).to.eql([ 'attr1', 'attr2', 'attr3' ]);
    expect( analyser.getAttributes('edge') ).to.eql([ 'eattr1', 'eattr2' ]);

    expect( analyser.getTypes('node','attr1') ).to.have.members([ ATTR_TYPE.STRING ]);
    expect( analyser.getTypes('node','attr2') ).to.have.members([ ATTR_TYPE.NUMBER ]);
    expect( analyser.getTypes('node','attr3') ).to.have.members([ ATTR_TYPE.STRING, ATTR_TYPE.NUMBER ]);
    expect( analyser.getTypes('node','blahb') ).to.be.undefined;
  });


  it('add a node and an edge', () => {
    cy.add({ data: { // node
      id: 'x',
      attr1: 'asdf',
      attr2: 1.0 
    }});
    cy.add({ data: { //edge
      id: 'ax', 
      source: 'a', 
      target: 'x' 
    }});

    expect( analyser.getCount('node') ).to.equal( 4 );
    expect( analyser.getCount('edge') ).to.equal( 2 );
  });

});
