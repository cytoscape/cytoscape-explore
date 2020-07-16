import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import NetworkEditor from './components/network-editor';
import PageNotFound from './components/page-not-found';

export const Router = () => (
  <BrowserRouter>
    <Switch>
      <Route
        path='/'
        component={NetworkEditor}
        exact 
      />
      <Route 
        status={404} 
        component={PageNotFound} 
        exact 
      />
    </Switch>
  </BrowserRouter>
);

export default Router;