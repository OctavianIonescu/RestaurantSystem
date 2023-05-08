import React, { useContext, useState, useEffect } from "react";
import Button from "../../../Utilities/Button";
import BasketContext from "../../../Context/BasketContext";
import LocationContext from "../../../Context/LocationContext";
import SelectTable from "./SelectTable";
import Checkout from "./Checkout";
import Popup from "../../../Context/PopupContext";
import { Redirect } from "react-router-dom"
import "../../../css/finalPage.css"


/**
 * Specific button for confirming an order, this brings up the checkout UI.
 *
 * @return {*} 
 */
const ConfirmButton = () => {
  const { location } = useContext(LocationContext);
  const { tableNumber, justClearItems, isEmpty } = useContext(BasketContext);
  const [showingPopup, setshowingPopup] = useState(false);
  const [neededTable, setneededTable] = useState(tableNumber <= 0);
  const [pay, setpay] = useState(false);
  const close = () => {
    setshowingPopup(false);
  }
  useEffect(() => {
    if (neededTable && tableNumber > 0) {
      setneededTable(false);
      setTimeout(() => {
        setshowingPopup(true);
      }, 0);
    }
  }, [neededTable, tableNumber]);
  const getTable = () => {
    setneededTable(tableNumber <= 0);
    setshowingPopup(true)
  }
  /**
   * Asks customer for table number only if they have selected a restaurant.
   *
   * @return {*} 
   */
  const getButton = () => {
    if (location !== null && !isEmpty()) {
      return (
        <Button onClick={getTable} icon="thumb_up_alt">
          Confirm Order
        </Button>
      );
    } else {
      return null;
    }
  }
  const [showConfirmation, setshowConfirmation] = useState(false);
  const ordersent = () => {
    setshowingPopup(false);
    setshowConfirmation(true);
    justClearItems();
  }
  const newOrder = () => {
    //just clear the items but keep the location and table number.
    setshowConfirmation(false);
  }
  const showpay = () => {
    setshowConfirmation(false);
    setpay(true);
  }
  if (pay) {
    return (
      <Redirect to="/checkout" />
    )
  }
  return (
    <>
      {getButton()}
      <Popup
        showing={showingPopup && tableNumber <= 0}
        onOutsideClick={close}
      >
        <SelectTable
          close={close}
        />
      </Popup>
      <Popup
        showing={showingPopup && tableNumber > 0}
        onOutsideClick={close}
      >
        <Checkout
          close={close}
          orderSent={ordersent}
        />
      </Popup>
      <Popup
        showing={showConfirmation}
      >
        <div className="finalPage">
          <h2>You order has been sent</h2>
          <p>your food is on its way!!!</p>
          <div className="button-bar">
            <Button onClick={newOrder} icon="replay">
              new order
             </Button>
            <Button onClick={showpay} icon="done">
              Pay now
            </Button>
          </div>
        </div>
      </Popup>
    </>
  )

}
export default ConfirmButton;
