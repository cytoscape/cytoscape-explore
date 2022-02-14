import { expect } from 'chai';
// import { NDEx } from 'ndex-client';
import Cytoscape from 'cytoscape';
import fs from 'fs';
import path from 'path';
import PouchDB from 'pouchdb';
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';
PouchDB.plugin(PouchDBMemoryAdapter);


import CytoscapeSyncher from '../src/model/cytoscape-syncher';

import { CX_DATA_KEY, exportCXEdgeID, exportCXNodeID, getCXType, getCXValue, IS_CX_ELE } from '../src/model/import-export/cx/cx-util';
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
    };

    expect(labelLocationMapper.valueCvtr(input)).to.deep.equal(output);
    // sanity check an issue where the labelLocationMapper would produce
    // the wrong result after calling it once (mutation related issue)
    expect(labelLocationMapper.valueCvtr(input)).to.deep.equal(output);
  });

  it('imports networks to CE', () => {
    let cxDir = './fixtures/cy-cx-conversion/output/';
    let cxFiles = fs.readdirSync(path.resolve(__dirname, cxDir));

    cxFiles.forEach(async cxFile => {
      const fileInputPath = path.resolve(__dirname, cxDir, cxFile);

      const input = JSON.parse(fs.readFileSync(fileInputPath));
      const cy = new Cytoscape();
      cy.data({id: '_cx2_import_test'});
      const cySyncher = new CytoscapeSyncher(cy, 'test');

      cy.importCX2(input);
      const output = cy.exportCX2();

      expect(cy.data(CX_DATA_KEY) != null).to.equal(true);
      cy.nodes().forEach(n => {
        expect(n.data(IS_CX_ELE)).to.equal(true);
        expect(isNaN(exportCXNodeID(n.id()))).to.equal(false);
      });
      cy.edges().forEach(e => {
        expect(e.data(IS_CX_ELE)).to.equal(true);
        expect(isNaN(exportCXEdgeID(e.id()))).to.equal(false);
      });
    });
  });
});

describe('Exporting CE networks to CX', () => {
    before(() => {
      // registerCytoscapeExtensions();
    });

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
