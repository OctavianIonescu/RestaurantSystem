import React, { useContext, useState, useEffect } from 'react';
import MealIcons from "../../../Utilities/Icons"
import Popup from "../../../Context/PopupContext";
import "../../../css/OrderItem.css";
import OrderDetails from "./OrderDetails";
import EditMenuContext from "../../../Context/EditMenuContext";
import EditOrderDetails from "../../StaffView/EditOrderDetails"
import SelectRestaurant from "../HeaderComponents/SelectRestaurant"
import toPounds from "../../../Utilities/formatMoney";

/**
 * Represents a menu item a user can order
 *
 * @param {*} props
 * @return {*} each item in the order
 */
const OrderItem = (props) => {
  /* sets order item to expand or shrink when clicked */
  const { isEditable, menuChange, setMenuChange } = useContext(EditMenuContext);
  const [inStock, setinStock] = useState(props.inStock);
  const [showingPopup, setshowingPopup] = useState(false);
  const [price, setprice] = useState(props.price);
  useEffect(() => {
    if (menuChange !== null && menuChange?.details?.name === props.name) {
      if ("inStock" in menuChange){
        setinStock(menuChange.inStock);
      }
      if("price" in menuChange){
        setprice(menuChange.price);
      }
      setMenuChange(null)
    }
  }, [setinStock, setMenuChange, menuChange, props, inStock, price]);


  const showDetails = () => {
    setshowingPopup(true);
  }
  const close = () => {
    setshowingPopup(false);
  }
  const closeCreateOrder = ()=>{
    setcreateOrderShown(false);
  }
  const [createOrderShown, setcreateOrderShown] = useState(false);
  const showCreateOrder = ()=>{
    setcreateOrderShown(true);
  }
  return (
    <>
      <Popup
        showing={showingPopup && isEditable}
        onOutsideClick={close}
      >
        <EditOrderDetails
          close={close}
          details={{ ...props, price, inStock}}
        />
      </Popup>
      <Popup
        showing={showingPopup && !isEditable}
        onOutsideClick={close}
      >
        <OrderDetails
          close={close}
          details={props}
          createOrder={showCreateOrder}
        />
      </Popup>
      <Popup
        showing={createOrderShown}
        onOutsideClick={closeCreateOrder}
      >
        <SelectRestaurant close={closeCreateOrder} />
      </Popup>
      <div className={`order-item${isEditable && !inStock ? " removed" : ""}`} onClick={showDetails}>
        <div className="item-on-menu">
          <h3> {props.name} </h3>
          <div className="menu-inner">
            <b> {toPounds(price)} </b>
            <MealIcons name={props.name} types={props.types} />
          </div>
        </div>
        <div
          className="img"
          role="img"
          aria-label={props.name}
          style={{ backgroundImage: `url("${props.img}")` }}
        />
      </div>
    </>
  );
}
export default OrderItem;
