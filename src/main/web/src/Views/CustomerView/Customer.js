import React, { Component, useContext, useState } from 'react';
import Menu from './MenuComponents/Menu'
import CustomerHeader from './HeaderComponents/CustomerHeader';
import SideBasket from './MenuComponents/SideBasket';
import LocationContext, { LocationContextProvider } from '../../Context/LocationContext';
import BasketContext, { BasketContextProvider } from '../../Context/BasketContext';
import { FilterContextProvider } from '../../Views/CustomerView/MenuComponents/Menu';
import CheckoutForm from "../../Utilities/CheckoutForm";
import { Route, Switch, Redirect } from "react-router-dom";
import Popup from "../../Context/PopupContext";
import Button from "../../Utilities/Button";
import "../../css/finalPage.css"
/**
 * Runs the main customer view.
 *
 * @return {*} 
 */
const MainApp = () => {
  return (
    <BasketContext.Consumer>
      {({ isEmpty }) => {
        return (
          <div className={`App${isEmpty() ? " hidden" : ""}`}>
            <CustomerHeader title="Oaxaca's Menu" />
            <SideBasket />
            <Menu />
          </div>
        );
      }}
    </BasketContext.Consumer>
  );
}
const CheckoutFormWrapper = () => {
  const { tableNumber, justClearItems } = useContext(BasketContext);
  const { location } = useContext(LocationContext);
  const [back, setback] = useState(false);
  const [showSuccess, setshowSuccess] = useState(false);
  const goBack = () => {
    setback(true);
  }
  const onSuccess = () => {
    setshowSuccess(true);
    justClearItems();
  }
  if (back) {
    return (
      <Redirect to="/" />
    )
  }
  return (
    <div className="fullscreen">
      <>
        <CheckoutForm tableNumber={tableNumber} branchID={location.branchID} success={onSuccess} back={goBack} />
        <Popup
          showing={showSuccess}
        >
          <div className="finalPage inverted">
            <h2>Payment successfully taken</h2>
            <div className="button-bar">
              <Button onClick={goBack} icon="replay">
                Start new order
              </Button>
            </div>
          </div>
        </Popup>
      </>
    </div>
  )
}
class Customer extends Component {
  render() {
    return (
      <BasketContextProvider>
        <LocationContextProvider>
          <FilterContextProvider>
            <Switch>
              <Route path="/checkout" component={CheckoutFormWrapper} />
              <Route path="/" component={MainApp} />
            </Switch>
          </FilterContextProvider>
        </LocationContextProvider>
      </BasketContextProvider>

    );
  }
}
export default Customer