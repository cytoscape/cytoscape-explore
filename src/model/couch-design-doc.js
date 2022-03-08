export const DESIGN_DOC_ID  = '_design/doc';
export const SNAPSHOTS_VIEW = '_design/doc/_view/snapshots';
// export const NETWORK_FILTER = 'doc/network';

export const COUCH_DESIGN_DOC = {
  _id: DESIGN_DOC_ID,
  views: {
    snapshots: {
      map: function(doc) { 
        if(doc.snapshot) {
          emit(doc._id, { timestamp: doc.timestamp }); // eslint-disable-line
        }
      }.toString()
    }
  },
  // filters: {
  //   network: function(doc) { 
  //     if(doc.snapshot) {
  //       return false;
  //     }
  //     return true;
  //   }.toString()
  // }
};

export default COUCH_DESIGN_DOC;
