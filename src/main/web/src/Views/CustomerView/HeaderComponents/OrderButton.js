import React, { useContext, useState } from 'react';
import Button from '../../../Utilities/Button';
import LocationContext from '../../../Context/LocationContext';
import SelectRestaurant from './SelectRestaurant';
import Popup from '../../../Context/PopupContext';

/**
 * specific buttion for starting an order, this starts with requesting the users store.
 *
 * @param {*} { onClick} event handler
 * @return {*} 
 */
const OrderButton = ({ onClick}) => {
  const { location, setLocation } = useContext(LocationContext);
  const [showingPopup, setshowingPopup] = useState(false);
  const getRest = () => {
    setshowingPopup(true);
    if (onClick && typeof onClick === "function") {
      setTimeout(onClick, 0);
    }
  }
  /**
   * If the customer has not selected a location, they can create an order
   * by entering their location and table number
   *
   * @return {*} create order button
   */
  const getButton = () => {
    if (location === null) {
      return (<Button onClick={getRest} icon="shopping_basket">Create Order</Button>);
    } else {
      //TODO: this should have a warning popup
      return (<Button onClick={() => { setLocation(null) }} icon="undo">Cancel Order</Button>);
    }
  }
  const close = () => {
    setshowingPopup(false);
  }

  return (
    <>
      {getButton()}
      <Popup
        showing={showingPopup}
        onOutsideClick={close}
      >
        <SelectRestaurant close={close} />
      </Popup>
    </>
  );
}

export default OrderButton;