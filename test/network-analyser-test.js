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
          attr2: null, 
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

    expect( analyser.getCount('node','attr1',ATTR_TYPE.STRING) ).to.equal( 3 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.MISSING) ).to.equal( 0 );
    expect( analyser.isMissing('node', 'attr1') ).to.be.false;
    expect( analyser.getNumberRange('node', 'attr1') ).to.be.undefined;

    expect( analyser.getCount('node','attr2',ATTR_TYPE.STRING) ).to.equal( 0 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.NUMBER) ).to.equal( 1 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.UNKNOWN) ).to.equal( 1 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.MISSING) ).to.equal( 1 );
    expect( analyser.isMissing('node', 'attr2') ).to.be.false;
    expect( analyser.getNumberRange('node', 'attr2') ).to.eql( { min: 1.0, max: 1.0 } );

    expect( analyser.getCount('node','attr3',ATTR_TYPE.STRING) ).to.equal( 1 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.NUMBER) ).to.equal( 1 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.MISSING) ).to.equal( 1 );
    expect( analyser.isMissing('node', 'attr3') ).to.be.false;

    expect( analyser.getCount('node','attr4',ATTR_TYPE.STRING) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.MISSING) ).to.equal( 3 );
    expect( analyser.isMissing('node', 'attr4') ).to.be.true;

    expect( analyser.getAttributes('node') ).to.eql([ 'attr1', 'attr2', 'attr3' ]);
    expect( analyser.getAttributes('edge') ).to.eql([ 'eattr1', 'eattr2' ]);

    expect( analyser.getTypes('node','attr1') ).to.have.members([ ATTR_TYPE.STRING ]);
    expect( analyser.getTypes('node','attr2') ).to.have.members([ ATTR_TYPE.NUMBER, ATTR_TYPE.UNKNOWN, ATTR_TYPE.MISSING ]);
    expect( analyser.getTypes('node','attr3') ).to.have.members([ ATTR_TYPE.STRING, ATTR_TYPE.NUMBER, ATTR_TYPE.MISSING ]);
    expect( analyser.getTypes('node','attr4') ).to.have.members([ ATTR_TYPE.MISSING ]);
    expect( analyser.getTypes('edge','eattr1')).to.have.members([ ATTR_TYPE.STRING ]);
  });


  it('add a node and an edge', () => {
    cy.add({ data: { // node
      id: 'x',
      attr1: 99,
      attr2: 2.0,
      attr4: 99
    }});
    cy.add({ data: { //edge
      id: 'ax', 
      source: 'a', 
      target: 'x',
      eattr1: 'asdf',
      eattr2: 200
    }});

    expect( analyser.getCount('node') ).to.equal( 4 );
    expect( analyser.getCount('edge') ).to.equal( 2 );

    expect( analyser.getCount('node','attr1',ATTR_TYPE.STRING) ).to.equal( 3 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.NUMBER) ).to.equal( 1 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.MISSING) ).to.equal( 0 );
    expect( analyser.isMissing('node', 'attr1') ).to.be.false;

    expect( analyser.getCount('node','attr2',ATTR_TYPE.STRING) ).to.equal( 0 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.NUMBER) ).to.equal( 2 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.UNKNOWN) ).to.equal( 1 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.MISSING) ).to.equal( 1 );
    expect( analyser.isMissing('node', 'attr2') ).to.be.false;
    expect( analyser.getNumberRange('node', 'attr2') ).to.eql( { min: 1.0, max: 2.0 } );

    expect( analyser.getCount('node','attr3',ATTR_TYPE.STRING) ).to.equal( 1 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.NUMBER) ).to.equal( 1 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.MISSING) ).to.equal( 2 );
    expect( analyser.isMissing('node', 'attr3') ).to.be.false;

    expect( analyser.getCount('node','attr4',ATTR_TYPE.STRING) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.NUMBER) ).to.equal( 1 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.MISSING) ).to.equal( 3 );
    expect( analyser.isMissing('node', 'attr4') ).to.be.false;

    expect( analyser.getNumberRange('edge', 'eattr2') ).to.eql( { min: 99, max: 200 } );

    expect( analyser.getAttributes('node') ).to.eql([ 'attr1', 'attr2', 'attr3', 'attr4' ]);
    expect( analyser.getAttributes('edge') ).to.eql([ 'eattr1', 'eattr2' ]);

    expect( analyser.getTypes('node','attr1') ).to.have.members([ ATTR_TYPE.STRING, ATTR_TYPE.NUMBER ]);
    expect( analyser.getTypes('node','attr2') ).to.have.members([ ATTR_TYPE.NUMBER, ATTR_TYPE.UNKNOWN, ATTR_TYPE.MISSING ]);
    expect( analyser.getTypes('node','attr3') ).to.have.members([ ATTR_TYPE.STRING, ATTR_TYPE.NUMBER, ATTR_TYPE.MISSING ]);
    expect( analyser.getTypes('node','attr4') ).to.have.members([ ATTR_TYPE.NUMBER, ATTR_TYPE.MISSING ]);
    expect( analyser.getTypes('edge','eattr1')).to.have.members([ ATTR_TYPE.STRING ]);
  });


  it('remove a node and an edge', () => {
    cy.remove(cy.$('#a')); // removes node 'a' and adjacent edge 'ab'

    // { data: { 
    //   id: 'a', 
    //   attr1: 'asdf',
    //   attr2: 1.0 
    // }},

    expect( analyser.getCount('node') ).to.equal( 2 );
    expect( analyser.getCount('edge') ).to.equal( 0 );

    expect( analyser.getCount('node','attr1',ATTR_TYPE.STRING) ).to.equal( 2 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.MISSING) ).to.equal( 0 );
    expect( analyser.isMissing('node', 'attr1') ).to.be.false;

    expect( analyser.getCount('node','attr2',ATTR_TYPE.STRING) ).to.equal( 0 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.UNKNOWN) ).to.equal( 1 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.MISSING) ).to.equal( 1 );
    expect( analyser.isMissing('node', 'attr2') ).to.be.false;

    expect( analyser.getCount('node','attr3',ATTR_TYPE.STRING) ).to.equal( 1 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.NUMBER) ).to.equal( 1 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.MISSING) ).to.equal( 0 );
    expect( analyser.isMissing('node', 'attr3') ).to.be.false;

    expect( analyser.getCount('node','attr4',ATTR_TYPE.STRING) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.MISSING) ).to.equal( 2 );
    expect( analyser.isMissing('node', 'attr4') ).to.be.true;

    expect( analyser.isMissing('edge', 'eattr1') ).to.be.true;
    expect( analyser.isMissing('edge', 'eattr2') ).to.be.true;

    expect( analyser.getAttributes('node') ).to.eql([ 'attr1', 'attr2', 'attr3' ]);
    expect( analyser.getAttributes('edge') ).to.eql([  ]);

    expect( analyser.getTypes('node','attr1') ).to.have.members([ ATTR_TYPE.STRING ]);
    expect( analyser.getTypes('node','attr2') ).to.have.members([ ATTR_TYPE.UNKNOWN, ATTR_TYPE.MISSING ]);
    expect( analyser.getTypes('node','attr3') ).to.have.members([ ATTR_TYPE.STRING, ATTR_TYPE.NUMBER ]);
    expect( analyser.getTypes('node','attr4') ).to.have.members([ ATTR_TYPE.MISSING ]);
    expect( analyser.getTypes('edge','eattr1')).to.have.members([ ATTR_TYPE.MISSING ]);
  });


  it('update data properties', () => {
    cy.$('#a').data('attr1', 22); // attr1 is now a number

    expect( analyser.getCount('node','attr1',ATTR_TYPE.STRING) ).to.equal( 2 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.NUMBER) ).to.equal( 1 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.MISSING) ).to.equal( 0 );
    expect( analyser.getTypes('node','attr1') ).to.have.members([ ATTR_TYPE.STRING, ATTR_TYPE.NUMBER ]);

    cy.$('#a').data('attr1', 'blarf'); // string agian!

    expect( analyser.getCount('node','attr1',ATTR_TYPE.STRING) ).to.equal( 3 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.MISSING) ).to.equal( 0 );
    expect( analyser.getTypes('node','attr1') ).to.have.members([ ATTR_TYPE.STRING ]);

    cy.$('#a').removeAttr('attr1'); 
    // cytoscape.js doesn't actually remove the data attribute, it sets it to undefined, so it ends um in the UNKNOWN category

    expect( analyser.getCount('node','attr1',ATTR_TYPE.STRING) ).to.equal( 2 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.UNKNOWN) ).to.equal( 1 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.MISSING) ).to.equal( 0 );
    expect( analyser.getTypes('node','attr1') ).to.have.members([ ATTR_TYPE.STRING, ATTR_TYPE.UNKNOWN ]);
  });

  it('remove two nodes at the same time', () => {
    cy.remove(cy.$('#a,#b')); // removes node 'a' and 'b'

    expect( analyser.getCount('node') ).to.equal( 1 );
    expect( analyser.getCount('edge') ).to.equal( 0 );

    expect( analyser.getCount('node','attr1',ATTR_TYPE.STRING) ).to.equal( 1 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr1',ATTR_TYPE.MISSING) ).to.equal( 0 );
    expect( analyser.isMissing('node', 'attr1') ).to.be.false;

    expect( analyser.getCount('node','attr2',ATTR_TYPE.STRING) ).to.equal( 0 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr2',ATTR_TYPE.MISSING) ).to.equal( 1 );
    expect( analyser.isMissing('node', 'attr2') ).to.be.true;

    expect( analyser.getCount('node','attr3',ATTR_TYPE.STRING) ).to.equal( 0 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.NUMBER) ).to.equal( 1 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr3',ATTR_TYPE.MISSING) ).to.equal( 0 );
    expect( analyser.isMissing('node', 'attr3') ).to.be.false;

    expect( analyser.getCount('node','attr4',ATTR_TYPE.STRING) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.NUMBER) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.UNKNOWN) ).to.equal( 0 );
    expect( analyser.getCount('node','attr4',ATTR_TYPE.MISSING) ).to.equal( 1 );
    expect( analyser.isMissing('node', 'attr4') ).to.be.true;

    expect( analyser.getAttributes('node') ).to.eql([ 'attr1', 'attr3' ]);

    expect( analyser.getTypes('node','attr1') ).to.have.members([ ATTR_TYPE.STRING ]);
    expect( analyser.getTypes('node','attr2') ).to.have.members([ ATTR_TYPE.MISSING ]);
    expect( analyser.getTypes('node','attr3') ).to.have.members([ ATTR_TYPE.NUMBER ]);
    expect( analyser.getTypes('node','attr4') ).to.have.members([ ATTR_TYPE.MISSING ]);
  });

});
