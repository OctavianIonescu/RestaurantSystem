import React, { Component } from 'react';
import './css/App.css';
import { Route, Switch } from "react-router-dom";
import Customer from './Views/CustomerView/Customer';
import Login from './Views/StaffView/Login';
import Manager from './Views/StaffView/Manager'
import { AuthContextProvider, PrivateRoute } from './Context/AuthContext';
import { PopupTarget } from "./Context/PopupContext";
import { StripeProvider } from "./Utilities/CheckoutForm"

/**
 * Main component of the web application
 *
 * @class App
 * @extends {Component}
 */
class App extends Component {

  /*renders page according to route path */
  render() {
    //uses a switch path to render the correct view as react uses single page application
    //customer view rendered through Customer component
    //login view for employees rendered through login component
    return (
      <main>
        <StripeProvider>
          <PopupTarget>
            <AuthContextProvider>
              <Switch>
                <Route path="/login" component={Login} />
                <PrivateRoute path="/manager" component={Manager} />
                <PrivateRoute path="/waiter" component={Manager} />
                <PrivateRoute path="/kitchen" component={Manager} />
                <Route path="/" component={Customer} />
              </Switch>
            </AuthContextProvider>
          </PopupTarget>
        </StripeProvider>
      </main>


    );
  }
}


export default App;
