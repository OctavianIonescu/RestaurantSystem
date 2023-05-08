import React, { useState, useContext, useEffect } from "react";
import OrderDetails from "./OrderDetails";
import Popup from "../../../Context/PopupContext";
import AuthContext from "../../../Context/AuthContext";
const Meal = item => {

  const [showingDetails, setshowingDetails] = useState(false);
  const close = () => {
    setshowingDetails(false);
  }
  const show = () => {
    setshowingDetails(true);
  }
  const toggleCheckbox = e => {
    if (e.currentTarget.checked) {
      item.setcheck(old => old + 1);
    }
    else {
      item.setcheck(old => old - 1);
    }
  }
  return (
    <>
      <Popup
        showing={showingDetails}
        onOutsideClick={close}
      >
        <OrderDetails close={close} details={item} />
      </Popup>

      <div className="table-order-item" >
        <b onClick={show} >{item.name}</b>
        <p onClick={show} >&times;{item.quantity}</p>
        {item.doing && (<input onChange={toggleCheckbox} type="checkbox" id={item.name} name={item.name} />)}
      </div>
    </>
  );
}

const Order = ({ items, orderTime, orderID, moveToDone, doing }) => {
  const [check, setcheck] = useState(0);
  const [canSend, setcanSend] = useState(doing);
  const { location } = useContext(AuthContext);


  useEffect(() => {
    if (check === items.length && canSend) {
      setcanSend(false)
      const retry = () => {
        setTimeout(() => {
          setcanSend(true);
        }, 500);
      }
      fetch("/api/kitchendone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchID: location.branchID, orderID })
      }).then(res => {
        if (res.ok) {
        } else {
          retry();
        }
      }).catch(() => {
        retry();
      })
    }
  }, [canSend, check, items.length, location.branchID, orderID]);
  const handleFormSubmit = e => {
    e.preventDefault();
    alert("done");
  }


  const basetime = new Date(orderTime);
  const toRow = item => (
    <div className="meal">
      <Meal setcheck={setcheck} doing={doing} {...item} />

    </div>
  )
  return (
    <form className="order-form" onSubmit={handleFormSubmit}>
      <div className="table-order">
        <div className="info">
          <h3>Order:{orderID}</h3>
          <p>{basetime.toLocaleTimeString("en-GB")}</p>
        </div>
        {items.map(toRow)}
      </div>
    </form>
  );
}
export default Order