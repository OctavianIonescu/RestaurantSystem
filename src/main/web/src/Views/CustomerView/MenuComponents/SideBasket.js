import React, { useContext, useState } from 'react';
import "../../../css/icons.css";
import "../../../css/SideBasket.css";
import BasketContext from "../../../Context/BasketContext";
import ConfirmButton from "../HeaderComponents/ConfirmButton";
import OrderDetails from "./OrderDetails";
import Popup from '../../../Context/PopupContext';

/**
 * Displays the customers basket at the side of the current window
 *
 * @return {*} 
 */
const SideBasket = () => {
  const { items, removeItem, setItem } = useContext(BasketContext);
  const [showDetails, setshowDetails] = useState(null);
  const [showPop, setshowPop] = useState(false);
  const showItem = item => {
    setshowDetails(item);
    setshowPop(true)
  }
  const itemfromRow = (item) => {
    return (
      <React.Fragment key={item.name}>
        <p onClick={() => { showItem(item) }}>{item.name}</p>
        <p onClick={() => { showItem(item) }}>&times;{item.quantity}</p>
        <div>
          <span className="material-icons" onClick={() => { showItem(item) }}>launch</span>
          <span className="material-icons" onClick={() => { removeItem(item) }}>remove</span>
          <span className="material-icons" onClick={() => { setItem(item, 0) }}>delete</span>
        </div>
      </React.Fragment>
    );
  };
  const close = () => {
    setshowPop(false)
  }
  return (
    <div className={`side-basket`}>
      <h1>Items</h1>
      <div className="item-grid">
        {Object.values(items).map(itemfromRow)}
      </div>
      <div className="spacer"></div>
      <div className="button-bar">
        <ConfirmButton />
      </div>
      <Popup
        showing={showPop}
        onOutsideClick={close}
        onClosed={() => { setshowDetails(null); }}
      >
        <OrderDetails
          close={close}
          details={showDetails}
        />
      </Popup>
    </div>
  );
}
export default SideBasket;