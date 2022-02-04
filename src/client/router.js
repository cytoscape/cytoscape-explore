import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { LoginController } from './components/login/controller';
import { Home } from './components/home';
import { NetworkEditor, NewDoc, Demo } from './components/network-editor';
import PageNotFound from './components/page-not-found';

const loginController = new LoginController();

export const Router = () => (
  <BrowserRouter>
    <Switch>
      <Route
        path='/'
        exact
        render={(props) => (
          <Home {...props} loginController={loginController} />
        )}
      />
    <Route path='/' exact component={Home} />
      <Route
        path='/document/:id/:secret'
        render={(props) => (
          <NetworkEditor {...props} loginController={loginController} />
        )}
      />
      <Route
        path='/document/:id'
        render={(props) => (
          <NetworkEditor {...props} loginController={loginController} />
        )}
      />
      <Route
        path='/document'
        render={(props) => (
          <NewDoc {...props} loginController={loginController} />
        )}
      />
      <Route
        path='/demo'
        render={(props) => (
          <Demo {...props} loginController={loginController} />
        )}
      />
      <Route status={404} exact component={PageNotFound} />
    </Switch>
  </BrowserRouter>
);

export default Router;