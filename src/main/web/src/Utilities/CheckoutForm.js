
import React, { useState, useEffect } from "react";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Button from "./Button";
import toPounds from "./formatMoney";
import "../css/CheckoutForm.css";
const stripePromise = loadStripe('pk_test_51IX9kDCo6oI17geMhnna7aPBOBuv28zlyzbpXQkpqngdb93Exwf1vnpQCpQo69GRPW1Wddro2MTwAPaNo96q3xRV001zlJ1eQi');

/**
 * Checkout form which requests table number
 * and branch ID from the REST API.
 *
 * @param {*} { tableNumber, branchID, success, back } the table number and branch id of the order
 */
const CheckoutForm = ({ tableNumber, branchID, success, back }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isError, setisError] = useState(false);
  const [items, setitems] = useState(null);
  const [needItems, setneedItems] = useState(true);
  const retryGetItems = () => {
    setTimeout(() => {
      setneedItems(true);
    }, 500);
  }
  useEffect(() => {
    if (needItems) {
      setneedItems(false);
      fetch("/api/getordereditems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          branchID
        })
      }).then(response => {
        if (response.ok) {
          response.json().then(data => {
            if(data.length === 0){
              back();
            }
            setitems(data)
          })
        } else {
          retryGetItems();
        }
      }
      ).catch(() => {
        retryGetItems();
      })
    }
  }, [back, branchID, needItems, tableNumber]);

  /**
   * Once an order is submitted, asks for payment information
   *
   * @param {*} event interface
   * @return {*} 
   */
  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log('[error]', error);
      setisError(true);
    } else {
      setisError(false)
      console.log('[PaymentMethod]', paymentMethod);
      fetch("/api/setpaid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          branchID
        })
      }).then(response => {
        if (response.ok) {
          success();
        } else {
          setisError(true);
        }
      }
      ).catch(() => {
        setisError(true);
      })
    }
  };

  /**
   * output items and their attributes into a row
   *
   * @param {*} item in the menu
   * @return {*} name, quantity and price of item in the menu
   */
  const itemfromRow = (item) => {
    return (
      <React.Fragment key={item.name}>
        <p>{item.name}</p>
        <p>&times;{item.quantity}</p>
        <p>{toPounds(item.price)}</p>
        <p>{toPounds(item.price * item.quantity)}</p>
      </React.Fragment>
    );
  };
  /**
   * displays checkout page and payment details
   *
   * @param {*} acc total price
   * @param {*} item in the menu
   */
  const min = (acc, item) => acc + item.price * item.quantity;
  return (

    <div className="paymentDetails">
      <form onSubmit={handleSubmit}>
        <h1>Please enter payment details:</h1>
        {isError ? (<b style={{ "color": "red", "display": "block", "marginBottom": "10px" }}>There has been an error</b>) : null}
        <div className="item-grid">
          <b>Name</b>
          <b>Quantity</b>
          <b>Price</b>
          <b>Total Price</b>
          {items === null ? (<p>loading...</p>) : items.map(itemfromRow)}
          <div className="finalPrice">
            {items === null ? null : toPounds(items.reduce(min, 0))}
          </div>
        </div>
        <div className="spacer"></div>
        <CardElement />
        <div className="button-bar">
          <Button icon="undo" onClick={back} >Return</Button>
          <Button type="submit" icon="done">Confirm</Button>
        </div>
      </form>
    </div>

  );
};

/**
 * using Stripe payment platform
 *
 * @param {*} {children}
 * @return {*} 
 */
const StripeProvider = ({children})=>{
  return (
    <Elements stripe={stripePromise}>{children}</Elements>
  );
}
export default CheckoutForm;
export { StripeProvider }