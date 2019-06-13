import { BrowserRouter, Route, Switch } from "react-router-dom";
import h from 'react-hyperscript';
import _ from 'lodash';
import NetworkEditor from './components/network-editor';
import PageNotFound from './components/page-not-found';

const routes = [
  {
    path: '/',
    render: () => {
      return h(NetworkEditor);
    }
  },
  {
    render: () => {
      return h(PageNotFound);
    },
    status: 404
  }
];

export const Router = () => (
  h( BrowserRouter, [
    h( Switch, routes.map( spec => {
      spec = _.defaults( spec, {
        exact: true
      } );

      return h( Route, spec );
    } ) )
  ] )
);

export default Router;