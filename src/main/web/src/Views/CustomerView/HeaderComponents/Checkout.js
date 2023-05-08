import React, { useState, useContext, useEffect } from "react";
import BasketContext from "../../../Context/BasketContext";
import LocationContext from "../../../Context/LocationContext";
import "../../../css/icons.css";
import "../../../css/Checkout.css";
import Button from "../../../Utilities/Button";
import toPounds from "../../../Utilities/formatMoney";
/**
 * Checkout page gets the table number and branch id from the API.
 * Displays items in the basket and total price
 *
 * @param {*} { close, orderSent }
 * @return {*} 
 */
const Checkout = ({ close, orderSent }) => {
  const { items, tableNumber, removeItem, setItem, isEmpty } = useContext(BasketContext);
  const { location } = useContext(LocationContext);
  const [errorMessage, seterrorMessage] = useState(null);
  const addToCart = () => {
    const arrangedItems = Object.values(items).map(({ name, quantity }) => { return { name, quantity } })
    fetch("/api/submitorder", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: tableNumber, restaurant: location.branchID, items: arrangedItems })
    }).then((response) => {
      if (response.ok) {
        orderSent();
      } else {
        response.text().then(text => {
          seterrorMessage(text);
        })
      }

    }).catch(() => {
      seterrorMessage("a network error has occurred");
    })
  }
  useEffect(() => {
    if (isEmpty()) {
      close();
    }
  }, [close, isEmpty]);

  const itemfromRow = (item) => {
    return (
      <React.Fragment key={item.name}>
        <p>{item.name}</p>
        <p>&times;{item.quantity}</p>
        <p>{toPounds(item.price)}</p>
        <p>{toPounds(item.price * item.quantity)}</p>
        <div>
          <span className="material-icons" onClick={() => { removeItem(item) }}>remove</span>
          <span className="material-icons" onClick={() => { setItem(item, 0) }}>delete</span>
        </div>
      </React.Fragment>
    );
  };
  const min = (acc, val) => acc + val.price * val.quantity;
  return (
    <div className="checkout">
      <h1>Confirm your order</h1>
      {errorMessage === null ? null : (<b style={{ "color": "red" }}>{errorMessage}</b>)}
      <p>Order for table:{tableNumber}</p>
      <div className="item-grid">
        <b>Name</b>
        <b>Quantity</b>
        <b>Price</b>
        <b>Total Price</b>
        <b>Remove</b>
        {Object.values(items).map(itemfromRow)}
        <div className="finalPrice">
          {toPounds(Object.values(items).reduce(min, 0))}
        </div>
      </div>
      <div className="button-bar">
        <Button onClick={close} icon="undo">
          Edit Order
        </Button>
        <Button onClick={addToCart}
          icon="done">
          Confirm
        </Button>

      </div>
    </div >
  );

}
export default Checkout;