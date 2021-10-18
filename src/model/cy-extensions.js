import Cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import VizMapper from './vizmapper';
import dagre from 'cytoscape-dagre';
import fcose from 'cytoscape-fcose';
import cola from 'cytoscape-cola';
import { isObject } from 'lodash';

import { exportCX, importCX } from './import-export/cx';
import { importJSON, exportJSON } from './import-export/json';

const registerCX2Exporter = Cytoscape => {

  function exportCX2(){
    return exportCX(this);
  }

  Cytoscape('core', 'exportCX2', exportCX2);
};

const registerCXImporter = Cytoscape => {
  function _importCX(cx){
    return importCX(this, cx);
  }

  Cytoscape('core', 'importCX', _importCX);
};

const registerImportJSON = Cytoscape => {
  function _importJSON(json){
    return importJSON(this, json);
  }

  Cytoscape('core', 'importJSON', _importJSON);
};

const registerExportJSON = Cytoscape => {
  function _exportJSON(){
    return exportJSON(this);
  }

  Cytoscape('core', 'exportJSON', _exportJSON);
};

const registerVizmapper = (Cytoscape) => {

  /**
   * Get the vizmapper
   * @type {Cytoscape.Core}
   * @returns {VizMapper} The vizmapper
   */
  function vizmapper(){
    let vm = this.scratch('_vizmapper');

    if( !vm ){
      let cySyncher = this.scratch('_cySyncher');

      vm = new VizMapper(this, cySyncher);

      this.scratch('_vizmapper', vm);

      return vm;
    }

    return vm;
  }

  Cytoscape('core', 'vizmapper', vizmapper);
};

const registerCyDataLocked = Cytoscape => {
  function dataLocked(bool){
    if(bool !== undefined){
      this.scratch('_dataLocked', !!bool);
    } else {
      let locked = this.scratch('_dataLocked');

      if( locked === undefined ){
        return true;
      } else {
        return locked;
      }
    }
  }

  Cytoscape('core', 'dataLocked', dataLocked);
};

export const registerCytoscapeExtensions = () => {
  Cytoscape.use(edgehandles);
  Cytoscape.use(registerVizmapper);
  Cytoscape.use(registerCyDataLocked);

  // import export
  Cytoscape.use(registerCX2Exporter);
  Cytoscape.use(registerCXImporter);
  Cytoscape.use(registerExportJSON);
  Cytoscape.use(registerImportJSON);

  // Layout extensions
  Cytoscape.use(dagre);
  Cytoscape.use(fcose);
  Cytoscape.use(cola);

  const cy = new Cytoscape();
  const ele = cy.add({});

  const eleProto = Object.getPrototypeOf(ele);
  const origEleStyle = eleProto.style;
  const origEleRemoveStyle = eleProto.removeStyle;

  eleProto.style = function(){
    if( process.NODE_ENV !== 'production' && arguments.length > 1 || (arguments.length === 1 && isObject(arguments[0])) ){
      console.warn(`Setting manual bypasses will not apply synchronised style for the graph.  Use the 'cy.vizmapper()' methods.  You can safely ignore this warning for temporary ad-hoc bypasses set by extensions.`);
    }

    return origEleStyle.apply(this, arguments);
  };

  eleProto.removeStyle = function(){
    if( process.NODE_ENV !== 'production' ){
      console.warn(`Setting manual bypasses will not apply synchronised style for the graph.  Use the 'cy.vizmapper()' methods.  You can safely ignore this warning for temporary ad-hoc bypasses set by extensions.`);
    }

    return origEleRemoveStyle.apply(this, arguments);
  };

  const cyProto = Object.getPrototypeOf(cy);
  const orgCyData = cyProto.data;
  const orgCyRemoveData = cyProto.removeData;

  cyProto.data = cyProto.attr = function(key){
    const warn = () => process.NODE_ENV !== 'production' && console.warn(`cy.data('id') can not be overwritten.  The ID will not be changed.`);

    if(this.dataLocked()){
      const prevIdExists = orgCyData.call(this, 'data') !== undefined;

      if(key === 'id' && arguments.length === 2 && prevIdExists){ // cy.data('id', 'foo')
        warn();
        return; // don't overwrite
      } else if(isObject(key)){ // cy.data({ id: 'foo' })
        const obj = key;

        if(obj.id !== undefined && prevIdExists){
          delete obj.id; // don't overwrite
          warn();
        }
      }
    }

    return orgCyData.apply(this, arguments);
  };

  cyProto.removeData = cyProto.removeAttr = function(key){
    const warn = () => process.NODE_ENV !== 'production' && console.warn(`cy.data('id') can not be removed.  The ID will not be removed.`);

    if(this.dataLocked()){
      if(key === 'id'){
        warn();
        return; // don't remove
      } else if(key === undefined){
        warn();

        // remove everything but id
        const data = this.data();
        Object.keys(data).filter(k => k !== 'id').forEach(k => {
          orgCyRemoveData.call(this, k);
        });

        return;
      } else {
        orgCyRemoveData.apply(this, arguments);
      }
    }

    return this;
  };
};
