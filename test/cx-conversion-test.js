import { expect } from 'chai';
// import { NDEx } from 'ndex-client';
import Cytoscape from 'cytoscape';
import fs from 'fs';
import path from 'path';

// import { NDEX_API_URL } from '../src/server/env';
import { registerCytoscapeExtensions } from '../src/model/cy-extensions';
import { getCXType } from '../src/model/import-export/cx/cy-converter';

describe('CX Conversion', () => {

    // const networkIds = [
    //   '7fc70ab6-9fb1-11ea-aaef-0ac135e8bacf',
    //   '748395aa-0abd-11ec-b666-0ac135e8bacf',
    //   'd9fcbe8c-85d5-11eb-9e72-0ac135e8bacf',
    //   '9a8f5326-aa6e-11ea-aaef-0ac135e8bacf',
    //   '84e36f91-ecb7-11eb-b666-0ac135e8bacf',
    //   '78db519f-eb1d-11eb-b666-0ac135e8bacf',
    //   '3a5206c2-fd4e-11e7-adc1-0ac135e8bacf',
    //   'ce6f751c-bbbf-11ea-aaef-0ac135e8bacf',
    //   '7ba07ae4-a4d7-11ea-aaef-0ac135e8bacf',
    //   'a3413631-1fc9-11ec-9fe4-0ac135e8bacf',
    //   '01db03fd-6195-11e5-8ac5-06603eb7f303',
    //   'b6a2b668-8b60-11eb-9e72-0ac135e8bacf',
    //   'c3929589-ff8c-11eb-b666-0ac135e8bacf',
    //   'e9435f90-1ec5-11ec-9fe4-0ac135e8bacf'
    // ];

    // it('converts networks from cx to cy.js', async () => {
    //   const ndex = new NDEx(NDEX_API_URL);
    //   const rawcx2 = await ndex.getCX2Network(networkIds[0]);

    //   console.log(JSON.stringify(rawcx2, null, 2));
    // });

    it('converts networks from CE to CX', () => {
      let inputPath = './fixtures/cy-cx-conversion/input/';
      let outputPath = './fixtures/cy-cx-conversion/output/';
      let fixtures = fs.readdirSync(path.resolve(__dirname, inputPath));

      registerCytoscapeExtensions();

      fixtures.forEach(file => {
        let input = JSON.parse(fs.readFileSync(path.resolve(__dirname, inputPath, file)));
        let expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, outputPath, `${file}.cx`)));
        let cy = new Cytoscape();
        cy.importJSON(input);
        let output = cy.exportCX2();
        expect(output).to.deep.equal(expected);
      });
    });

    it('produces a cx type string for supported values', () => {
      let tests = [
        {
          input: 'blah',
          output: 'string'
        },
        {
          input: true,
          output: 'boolean'
        },
        {
          input: -1,
          output: 'integer'
        },
        {
          input: 0,
          output: 'integer'
        },
        {
          input: 2147483647,
          output: 'long'
        },
        {
          input: -2147483648,
          output: 'long'
        },
        {
          input: 0.1,
          output: 'double'
        },
        {
          input: {},
          output: null
        },
        {
          input: [],
          output: null
        },
        {
          input: ['a', 'b'],
          output: 'list_of_string'
        },
        {
          input: [1, 2, 3],
          output: 'list_of_integer'
        },
        {
          input: [1.1, 2.2, 3.3],
          output: 'list_of_double'
        },
        {
          input: [214748364734, -34147483647, 34924939423],
          output: 'list_of_long'
        },
        {
          input: [true, false, true],
          output: 'list_of_boolean'
        },
        {
          input: [['a'], ['b'], [1]],
          output: null
        },
        {
          input: [{}, {}],
          output: null
        },
        {
          input: [['a'], ['b']],
          output: null
        },

        // These test cases are ambiguous.  This is the current
        // behaviour but that doesn't mean it can't change in the future
        {
          input: [0, 0.0],
          output: 'list_of_integer'
        },
        {
          input: [214748364734, 0.0, 34924939423],
          output: null
        },
        {
          input: [214748364734, 0, 34924939423],
          output: null
        },
        {
          input: ['a', null],
          output: null
        }
      ];

      tests.forEach( t => expect(getCXType(t.input)).to.equal(t.output) );
    });
});
