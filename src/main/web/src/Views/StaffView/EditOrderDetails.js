import React, { useState,useContext, useRef } from "react";
import Collapsible from "react-collapsible";
import Button from "../../Utilities/Button";
import MealIcons from "../../Utilities/Icons";
import "../../css/OrderDetails.css"
import "../../css/EditOrderDetails.css"
import AuthContext from "../../Context/AuthContext";
import EditMenuContext from "../../Context/EditMenuContext";
import toPounds from "../../Utilities/formatMoney";
/* This gets all the details for a menu item in the users current context */

/**
 * Class for allowing the editing of orders.
 * 
 * @author Team21
 *
 */

const OrderDetails = ({ details, close }) => {
  const { location } = useContext(AuthContext);
  const { setMenuChange } = useContext(EditMenuContext);
  const ingredientJoiner = (ingredient) =>
    ingredient.name + " " + ingredient.percentage + "%, ";
  const ingredientstoHtml = (ingredient) =>
    ingredient.isAllergen ? (
      <b key={ingredient.name}>{ingredientJoiner(ingredient)}</b>
    ) : (
        ingredientJoiner(ingredient)
      );
  const [inStock, setinStock] = useState(details.inStock);
  const updateStock = () => {
    fetch("/api/setStock", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealName: details.name, branchID: location.branchID , inStock:!inStock})
    }).then(res => {
      if(res.status === 200){
        setinStock(!inStock);
        setMenuChange({ details, inStock:!inStock})
      }else{
        setTimeout(updateStock, 500);
      }
    }).catch(() => {
      setTimeout(updateStock, 500);
    })
  }
  const [price, setprice] = useState(details.price);
  const userPrice = useRef(null);
  const updatePrice = () => {
    const newPrice = Math.round(Number(userPrice.current.value)*100)
    if(!isNaN(newPrice)){
      fetch("/api/menu", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: "setMealPrice", name: details.name, branchID: location.branchID, price: newPrice })
      }).then(res => {
        if (res.status === 200) {
          setMenuChange({ details, price:newPrice })
          setprice(newPrice)
        }else{
          setTimeout(updatePrice, 500);
        }
      }).catch(()=>{
        setTimeout(updatePrice, 500);
      })
    }
  }
  
  return (
    <div className="lightbox">
      <div className="title">
        <h2>{details.name}</h2>
        <div>
          <p>{toPounds(price)}</p>
          <MealIcons name={details.name} types={details.types} />
        </div>

      </div>
      <div className="pair">
        <div>
          <img
            src={details.img}
            alt={details.name}
            width="500"
            height="600"
          ></img>
        </div>
        <div className="desc">{details.description}</div>
      </div>

      <div className="ingredients">
        <Collapsible trigger="Ingredients">
          {details.ingredients.map(ingredientstoHtml)}
        </Collapsible>
      </div>
      <Button onClick={updateStock} icon={inStock ? "thumb_down_alt" : "thumb_up_alt"}>{inStock ? "Remove from stock" : "Add to stock"}</Button>
      <div className="update-price-controls">
        <label htmlFor="userprice">New Price: £</label>
        <input type="number" id="userprice" name="userprice" min="0" max="100" step="0.01" defaultValue={price/100} ref={userPrice} />
        <Button icon="done" onClick={updatePrice}>
          update price
        </Button>
      </div>
      <div className="button-bar">
        <Button onClick={close} icon="undo">
          Return
        </Button>
        <Button icon="done" onClick={close}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default OrderDetails;
