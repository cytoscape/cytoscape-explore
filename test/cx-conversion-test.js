import { expect } from 'chai';
// import { NDEx } from 'ndex-client';
import Cytoscape from 'cytoscape';
import fs from 'fs';
import path from 'path';
import PouchDB from 'pouchdb';
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';
PouchDB.plugin(PouchDBMemoryAdapter);


// import CytoscapeSyncher from '../src/model/cytoscape-syncher';

import { registerCytoscapeExtensions } from '../src/model/cy-extensions';
import { getCXType, getCXValue } from '../src/model/import-export/cx/cx-util';
import { labelLocationMapper } from '../src/model/import-export/cx';
import { STYLE_TYPE } from '../src/model/style';

describe('Importing CX networks to CE', () => {
  it('converts nodel label position CX values to CE', () => {
    const input = {
      HORIZONTAL_ALIGN: 'center',
      VERTICAL_ALIGN: 'top',
      HORIZONTAL_ANCHOR: 'center',
      VERTICAL_ANCHOR: 'bottom',
      MARGIN_X: -34.98,
      MARGIN_Y: -25.65,
      JUSTIFICATION: 'center'
    };

    const output = {
        "text-halign": {
          "type": "STRING",
          "mapping": "VALUE",
          "value": "center",
          "stringValue": "center"
        },
        "text-valign": {
          "type": "STRING",
          "mapping": "VALUE",
          "value": "bottom",
          "stringValue": "bottom"
        }
    }

    expect(labelLocationMapper.valueCvtr(input)).to.deep.equal(output);
    // sanity check an issue where the labelLocationMapper would produce
    // the wrong result after calling it once (mutation related issue)
    expect(labelLocationMapper.valueCvtr(input)).to.deep.equal(output);
  })
});

describe('Exporting CE networks to CX', () => {
    before(() => {
      registerCytoscapeExtensions();
    });
    // const NDEX_TEST_API_URL = 'https://dev.ndexbio.org/v2';
    // const NDEX_TEST_USER = 'testtesttest';
    // const NDEX_TEST_PASSWORD = '123123123';

    // const networkIds = [
    //   '4ae2709d-3055-11ec-94bf-525400c25d22',
    //   '8baf882a-3056-11ec-94bf-525400c25d22',
    //   '8b957078-3056-11ec-94bf-525400c25d22',
    //   '8b51d7c5-3056-11ec-94bf-525400c25d22',
    //   '8b3faf53-3056-11ec-94bf-525400c25d22',
    //   'f9dce77c-3055-11ec-94bf-525400c25d22',
    //   'f9ca49da-3055-11ec-94bf-525400c25d22',
    //   'f9aeab88-3055-11ec-94bf-525400c25d22',
    //   'f99975d6-3055-11ec-94bf-525400c25d22',
    //   'f96b39e4-3055-11ec-94bf-525400c25d22',
    //   'f950ad02-3055-11ec-94bf-525400c25d22',
    //   'f625f9ef-3055-11ec-94bf-525400c25d22',
    // ];

    // basic test to import a network to CE from CX, and then
    // export it again as CX2.
    // it('converts networks from cx to cy.js', async () => {
    //   const ndex = new NDEx(NDEX_TEST_API_URL);
    //   const expected = [];
    //   const actual = [];

    //   for(let i = 0; i < networkIds.length; i++){
    //     const networkId = networkIds[i];

    //     try {
    //       const cx = await ndex.getCX2Network(networkId);
    //       const cy = new Cytoscape();
    //       cy.data({id: 'test'});
    //       const cySyncher = new CytoscapeSyncher(cy, 'test');
    //       cy.importCX(cx);


    //       expected.push(cx);

    //       actual.push(cy.exportCX2());

    //       cySyncher.destroy();
    //       cy.destroy();

    //     } catch (err) {
    //       console.log(err);
    //     }
    //   }

    //   expect(expected[0]).to.deep.equal(actual[0]);
    // }).timeout(100000);
    it('converts CE style values to CX style values', () => {
      let tests = [
          {
            input: {
              type: STYLE_TYPE.NUMBER,
              value: 1
            },
            output: 1
          },
          {
            input: {
              type: STYLE_TYPE.STRING,
              value: '1'
            },
            output: '1'
          },
          {
            input: {
              type: STYLE_TYPE.COLOR,
              value: {
                r: 100,
                g: 100,
                b: 100
              },
            },
            output: '#646464'
          }
      ];

      tests.forEach(({input, output}) => {
        expect(getCXValue(input)).to.equal(output);
      });
    });

    it('converts networks from CE to CX', () => {
      let inputPath = './fixtures/cy-cx-conversion/input/';
      let outputPath = './fixtures/cy-cx-conversion/output/';
      let fixtures = fs.readdirSync(path.resolve(__dirname, inputPath));

      fixtures.forEach(file => {
        let fileInputPath = path.resolve(__dirname, inputPath, file);
        let fileOutputPath = path.resolve(__dirname, outputPath, `${file}.cx`);

        let input = JSON.parse(fs.readFileSync(fileInputPath));
        let expected = JSON.parse(fs.readFileSync(fileOutputPath));

        let cy = new Cytoscape();
        cy.importJSON(input);
        let output = cy.exportCX2();

        // fs.writeFileSync(fileOutputPath, JSON.stringify(output, null, 2));
        expect(output).to.deep.equal(expected);
      });
    });

    it('produces a CX type string for supported values', () => {
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
