import { EventEmitterProxy } from './event-emitter-proxy';
import EventEmitter from 'eventemitter3';
import { isClient } from '../util';
import PouchDB  from 'pouchdb';
import { DocumentNotFoundError } from './errors';
import _ from 'lodash';
import { MAPPING, NODE_STYLE_PROPERTIES, EDGE_STYLE_PROPERTIES, DEFAULT_NODE_STYLE, DEFAULT_EDGE_STYLE, stylePropertyExists, getFlatStyleForEle } from './style';

const PORT = process.env.PORT;
const SYNC_INTERVAL = 1000;

// TODO remove debug logging
const log = console.log; // eslint-disable-line

const assertSelectorIsNodeOrEdge = selector => {
  if( selector !== 'node' && selector !== 'edge' ){
    throw new Error(`Selector must be 'node' or 'edge'`);
  }
};

const assertElesNonempty = eles => {
  if( !eles || eles.length === 0 ){
    throw new Error(`Elements must be specified for a bypass`);
  }
};

const assertPropertyIsSupported = (property, selector) => {
  if( !stylePropertyExists(property, selector) ){
    const selectorDisp = selector ? `'${selector}'` : 'any selector';

    throw new Error(`Property '${property}' is not supported for ${selectorDisp}`);
  }
};

/**
 * A client creates an instance of `CytoscapeSyncher` to automatically manage synchronisation
 * of the Cytoscape network with the server.
 * @type CytoscapeSyncher
 */
export class CytoscapeSyncher {
  /**
   * Create a `CytoscapeSyncher` which has live-synch disabled.
   *
   * @param {Cytoscape} cy The Cytoscape instance to synchronise.
   * @param {String} secret The secret token used for write authenication.
   */
  constructor(cy, secret){
    if( !cy ){
      throw new Error(`Can't create a 'CytoscapeSyncher' without a 'cy'.`);
    }

    const networkId = cy.data('id');

    if( networkId == null ){
      throw new Error(`'cy' must have a data ID to be used as a primary key.`);
    }

    this.enabled = false;
    this.loadedOrCreated = false;

    this.cy = cy;
    this.secret = secret;
    this.dbName = networkId;
    this.docId = networkId;

    this.emitter = new EventEmitter();
    this.cyEmitter = new EventEmitterProxy(this.cy);

    this.localDb = new PouchDB(this.dbName, { adapter: 'memory' }); // store in memory to avoid multitab db event noise

    const pouchOrigin = isClient() ? location.origin : `http://localhost:${PORT}`;

    this.remoteDb = new PouchDB(`${pouchOrigin}/db/${this.dbName}`);
  }

  enable(){
    if( this.enabled ){ return; }

    this.enabled = true;

    this.addListeners();
  }

  disable(){
    if( !this.enabled ){ return; }

    this.enabled = false;

    this.removeListeners();
  }

  async create(){
    if( this.loadedOrCreated ){
      throw new Error(`Can't create a CytoscapeSyncher after it's already been loaded or created`);
    }

    const { localDb, remoteDb, cy, docId } = this;

    const doc = {
      _id: docId,
      data: _.clone(cy.data())
    };

    await localDb.put(_.clone(doc));

    // do initial, one-way synch from local db to server db
    const info = await localDb.replicate.to(remoteDb);

    if( info.errors != null && info.errors.length > 0 ){
      const err = new Error('CytoscapeSyncher create failed');
      err.info = info;

      throw err;
    }

    this.loadedOrCreated = true;
  }

  async load(){
    if( this.loadedOrCreated ){
      throw new Error(`Can't load a CytoscapeSyncher after it's already been loaded or created`);
    }

    const { cy, localDb, remoteDb, dbName, docId } = this;

    // do initial, one-way synch from server db to local db
    const info = await localDb.replicate.from(remoteDb);

    if( info.errors != null && info.errors.length > 0 ){
      const err = new Error('CytoscapeSyncher load failed');
      err.info = info;

      throw err;
    }

    const res = await localDb.allDocs({
      include_docs: true
    });

    if( res.total_rows === 0 ){
      throw new DocumentNotFoundError(dbName, docId, 'The database is empty');
    }

    let foundCyDoc = false;
    let eleJsons = [];

    for( let i = 0; i < res.rows.length; i++ ){
      let row = res.rows[i];
      let { doc } = row;

      if( row.id === this.docId ){
        cy.data( _.clone(doc.data) );

        cy.scratch({
          rev: doc._rev
        });

        foundCyDoc = true;
      } else {
        eleJsons.push({
          data: _.clone(doc.data),
          position: _.clone(doc.position),
          scratch: {
            rev: doc._rev
          }
        });
      }
    }

    if( !foundCyDoc ){
      throw new DocumentNotFoundError(dbName, docId, 'Could not find network document');
    }

    if( eleJsons.length > 0 ){
      cy.add(eleJsons);
    }

    this.loadedOrCreated = true;
  }

  /**
   * @private
   */
  addListeners(){
    this.dirtyEles = this.cy.collection();
    this.dirtyCy = false;

    const ignoreTargetEle = target => (
      target.hasClass('eh-handle')
      || target.hasClass('eh-preview')
      || target.hasClass('eh-ghost')
    );

    const isValidTargetEle = target => !ignoreTargetEle(target);

    const canUpdate = () => this.enabled && !this.updatingFromRemoteChange;

    const synchLoop = async () => {
      if( !canUpdate() ){
        // try next time
        this.synchTimeout = setTimeout(synchLoop, SYNC_INTERVAL);

        return;
      }

      this.runningSyncLoop = true;

      const docsToWrite = this.dirtyEles.map(ele => ({
        _id: ele.id(),
        _rev: ele.scratch('rev'),
        _deleted: ele.removed(),
        data: _.clone(ele.data()),
        position: _.clone(ele.position())
      }));

      if( this.dirtyCy ){
        docsToWrite.push({
          _id: this.cy.data('id'),
          _rev: this.cy.scratch('rev'),
          data: _.clone(this.cy.data())
        });
      }

      // reset dirty flags
      this.dirtyCy = false;
      this.dirtyEles = this.cy.collection();

      if( docsToWrite.length > 0 ){
        const res = await this.localDb.bulkDocs(docsToWrite);

        res.forEach((doc) => {
          const { ok, id, rev } = doc;

          if( !ok ){
            log('Pouch bulk error', doc);
          } else {
            if( id === this.networkId ){
              this.cy.scratch({ rev });
            } else {
              this.cy.getElementById(id).scratch({ rev });
            }
          }
        });
      }

      this.synchTimeout = setTimeout(synchLoop, SYNC_INTERVAL);

      this.runningSyncLoop = false;
    };

    const onDirtyTarget = target => {
      if( canUpdate() ){
        if( target === this.cy ){
          this.dirtyCy = true;
        } else if( isValidTargetEle(target) ){
          this.dirtyEles.merge(target);
        }
      }
    };

    const onDirtyEvent = event => onDirtyTarget(event.target);

    // on local modifications to the network, request the change be synched
    ( this.cyEmitter
      .on('add', onDirtyEvent)
      .on('ehcomplete', (event, sourceNode, targetNode, addedEles) => {
        onDirtyTarget(addedEles); // assume only one edge added
      })
      .on('remove', onDirtyEvent)
      .on('data', onDirtyEvent)
      .on('position', event => {
        const syncPosAni = event.target.scratch('syncPosAni');

        if( syncPosAni == null || !syncPosAni.playing() ){
          onDirtyEvent(event);
        }
      })
    );

    // handle remote updates:
    this.synchHandler = ( this.localDb.sync(this.remoteDb, { live: true, retry: true })
      .on('change', info => {
        log('PouchDB change', info);

        const isUpdateFromOtherClient = info.direction === 'pull';

        if( isUpdateFromOtherClient ){
          this.updatingFromRemoteChange = true;

          const { docs } = info.change;

          for( let i = 0; i < docs.length; i++ ){
            const doc = docs[i];
            let id = doc._id;
            let rev = doc._rev;
            let deleted = doc._deleted;

            if( id === this.networkId ){
              this.cy.data(_.clone(doc.data));
              this.cy.scratch({ rev });
            } else {
              const ele = this.cy.getElementById(id);

              if( ele.nonempty() || deleted ){
                if( deleted ){
                  ele.remove();
                } else {
                  ele.data(_.clone(doc.data));
                  ele.scratch({ rev });

                  const elePos = ele.position();

                  if( doc.position.x !== elePos.x || doc.position.y !== elePos.y ){
                    const syncPosAni = ele.animation({
                      position: _.clone(doc.position),
                      duration: 250,
                      easing: 'ease-out'
                    });

                    const oldPosAni = ele.scratch('syncPosAni');

                    if( oldPosAni != null ){
                      oldPosAni.stop();
                    }

                    ele.scratch('syncPosAni', syncPosAni);

                    syncPosAni.play();
                  }
                }
              } else {
                this.cy.add({
                  data: _.clone(doc.data),
                  position: _.clone(doc.position),
                  scratch: { rev }
                });
              }
            }
          }

          this.updatingFromRemoteChange = false;
        }
      })
      .on('paused', info => {
        log('PouchDB paused', info);
      })
      .on('active', info => {
        log('PouchDB active', info);
      })
      .on('error', err => {
        log('PouchDB error', err);
      })
    );

    // start the async loop
    synchLoop();
  }

  /**
   * @private
   */
  removeListeners(){
    this.cyEmitter.removeAllListeners();

    this.synchHandler.cancel();
    this.synchHandler.removeAllListeners();

    clearTimeout(this.synchTimeout);
  }

  // TODO
  async importCX(){
    // TODO
    const json = null; // TODO build up json from cx

    this.importJson(json);
  }

  // TODO
  async exportCX(){
    // TODO read cy and return cx
  }

  // TODO
  async exportJson(){
    return this.cy.json(); // TODO maybe filter out vis-specific stuff
  }

  // TODO
  async importJson(json){
    // TODO verify that the network is empty

    this.cy.json(json);
  }

  // TODO
  resetStyle(){
    this.cy.data({ _styles: {} });

    this.emitter.emit('resetStyles');
  }

  /**
   * Sets a global style
   * @param {String} selector A selector of elements on which style is applied ('node' or 'edge')
   * @param {String} property The style property string
   * @param {StyleValue} value The style value (from `styleFactory`)
   */
  setStyle(selector, property, value){
    assertSelectorIsNodeOrEdge(selector);
    assertPropertyIsSupported(property, selector);

    const _styles = cy.data('_styles') || {};

    _.set(_styles, [selector, property], value);

    this.cy.data({ _styles });
    this.cy.$(selector).scratch({ dirtyStyle: Date.now() }); // TODO hack

    this.emitter.emit('setStyle', selector, property, value);
  }

  /**
   * Get the style
   * @param {String} selector The selector to get style for ('node' or 'edge')
   * @param {String} property The style property name
   */
  getStyle(selector, property){
    assertSelectorIsNodeOrEdge(selector);
    assertPropertyIsSupported(property, selector);

    const cy = this.cy;
    const _styles = cy.data('_styles') || {};
    const styleVal = _.get(_styles, [selector, property]);
    const DEF_STYLE = selector === 'node' ? DEFAULT_NODE_STYLE : DEFAULT_EDGE_STYLE;
    const def = _.get(DEF_STYLE, [property]);

    if( styleVal == null && def == null ){
      throw new Error(`No style value for '${property}' exists`);
    }

    return styleVal || def;
  }

  /**
   * Set a style bypass
   * @param {Collection} eles The elements to apply the bypass to
   * @param {String} property The style property name
   * @param {StyleValue} value The style value (from `styleFactory`)
   */
  setStyleBypass(eles, property, value){
    assertElesNonempty(eles);
    assertPropertyIsSupported(property);

    if( value.type !== MAPPING.VALUE ){
      throw new Error(`Can't set a bypass to a mapper`);
    }

    const _bypasses = cy.data('_bypasses') || {};
    const ids = eles.map(ele => ele.id());
    const setBypassForId = id => _.set(_bypasses, [id, property], value);

    ids.forEach(setBypassForId);

    // store synched data
    this.cy.data({ _bypasses });

    this.emitter.emit('setStyleBypass', eles, property, value);
  }

  /**
   * Get the style for a particular element and property
   * @param {Element} ele The Cytoscape element to get style for
   * @param {String} property The name of the style property (from `NODE_STYLE_PROPERTIES`)
   */
  getElementStyle(ele, property){
    const data = this.cy.data();
    const selector = ele.isNode() ? 'node' : 'edge';
    const DEF_STYLE = ele.isNode() ? DEFAULT_NODE_STYLE : DEFAULT_EDGE_STYLE;
    const id = ele.id();
    const style = _.get(data, ['_styles', selector, property]);
    const bypass = _.get(data, ['_bypasses', id, property]);
    const def = _.get(DEF_STYLE, [property]);
    const styleStruct = bypass || style || def;

    log(`Getting style for ${ele.id()} and ${property} with struct`, styleStruct);

    const flatVal = getFlatStyleForEle(ele, styleStruct);

    log(`Got flat value`, flatVal);

    return flatVal;
  }

  /**
   * Get the style block for the specified selector ('node' or 'edge')
   * @param {String} selector The selector to get styles for ('node' or 'edge')
   */
  getStyles(selector){
    assertSelectorIsNodeOrEdge(selector);

    if( selector === 'node' ){
      return this.getNodeStyles();
    } else {
      return this.getEdgeStyles();
    }
  }

  /**
   * Get a Cytoscape style selector block for nodes styles
   */
  getNodeStyles(){
    const props = NODE_STYLE_PROPERTIES;

    const styleBlock = {};

    const addToStyleBlock = (styleBlock, prop) => {
      styleBlock[prop] = ele => this.getElementStyle(ele, prop);

      return styleBlock;
    };

    const result = props.reduce(addToStyleBlock, styleBlock);
    return result;
  }

  /**
   * Get a Cytoscape style selector block for edge styles
   */
  getEdgeStyles(){
    const props = EDGE_STYLE_PROPERTIES;

    const styleBlock = {};

    const addToStyleBlock = (styleBlock, prop) => {
      styleBlock[prop] = ele => this.getElementStyle(ele, prop);

      return styleBlock;
    };

    return props.reduce(addToStyleBlock, styleBlock);
  }

  /**
   * A destructor method for the `CytoscapeSyncher`.  This cleans up references and
   * listeners such that the object can be purged by the garbage collector.
   */
  destroy(){
    this.removeListeners();
  }
}

export default CytoscapeSyncher;