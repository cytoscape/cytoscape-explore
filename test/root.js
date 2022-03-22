import { registerCytoscapeExtensions } from '../src/model/cy-extensions';

let expressServer;


before(async function() {
  this.timeout(15000);

  console.log("registering cytoscape extensions");
  registerCytoscapeExtensions();

  // Need to initialize express only once for the entire test suite.
  console.log("starting express server");
  const { server } = await import('../src/server');
  expressServer = server;
});


after(async function() {
  await expressServer.close();
  console.log("stopped express server");

  // TODO stop cytosnap instance(s)
});