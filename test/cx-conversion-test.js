import { assert, expect } from 'chai';
import { isSavedAspect } from '../src/model/import-export/cx/cxConverter'

describe('CX Conversion', () => {
  

  beforeEach('before each', () => {
   
  });


  it('saved aspects', () => {
    expect(isSavedAspect({'metaData': 'some stuff'})).to.be.true
  });


});
