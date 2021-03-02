import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import NetworkEditor from './components/network-editor';
import PageNotFound from './components/page-not-found';

export const Router = () => (
  <BrowserRouter>
    <Switch>
      <Route path='/' exact>
        <Redirect to='/document/demo' />
      </Route>
      <Route path='/document/:id/:secret' component={NetworkEditor} />
      <Route path='/document/:id' component={NetworkEditor} />
      <Route status={404} component={PageNotFound} exact />
    </Switch>
  </BrowserRouter>
);

export default Router;