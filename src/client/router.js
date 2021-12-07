import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { NetworkEditor, NewDoc, Demo } from './components/network-editor';
import PageNotFound from './components/page-not-found';

export const Router = () => (
  <BrowserRouter>
    <Switch>
      <Route path='/' exact>
        <Redirect to='/demo' />
      </Route>
      <Route path='/document/:id/:secret' component={NetworkEditor} />
      <Route path='/document/:id' component={NetworkEditor} />
      <Route path='/document' component={NewDoc} />
      <Route path='/demo' component={Demo} />
      <Route status={404} component={PageNotFound} exact />
    </Switch>
  </BrowserRouter>
);

export default Router;