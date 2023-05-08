import React, { useState } from "react";
import Collapsible from "react-collapsible";
import LocationContext from "../../../Context/LocationContext";
import BasketContext from "../../../Context/BasketContext";
import Button from "../../../Utilities/Button";
import MealIcons from "../../../Utilities/Icons";
import "../../../css/OrderDetails.css"
import toPounds from "../../../Utilities/formatMoney";

/**
 * This gets all the details for a menu item in the users current context
 *
 * @param {*} { details, close, createOrder }
 * @return {*} 
 */
const OrderDetails = ({ details, close, createOrder }) => {
  const [OldAmount, setOldAmount] = useState(null);
  const ingredientJoiner = (ingredient) =>
    ingredient.name + " " + ingredient.percentage + "%, ";
  const ingredientstoHtml = (ingredient) =>
    ingredient.isAllergen ? (
      <b key={ingredient.name}>{ingredientJoiner(ingredient)}</b>
    ) : (
      ingredientJoiner(ingredient)
    );
  const saveOldState = (amount) => {
    if (OldAmount === null) {
      setOldAmount(amount);
    }
  };
  return (
    <div className="lightbox">
      <div className="title">
        <h2>{details.name}</h2>
        <div>
          <p>{toPounds(details.price)}</p>
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
      <div className="button-bar">
        <LocationContext.Consumer>
          {({ location }) => {
            return (
              <BasketContext.Consumer>
                {({ items, addItem, removeItem, setItem }) => {
                  if (location === null) {
                    return (
                      <>
                        <Button onClick={close} icon="undo">
                          Return
                        </Button>
                        <Button onClick={() => { createOrder(); close(); }} icon="shopping_basket">Create Order</Button>
                      </>
                    );
                  }
                  const amount = (details?.name in items) ? items[details?.name].quantity : 0;
                  const isUnchanged = OldAmount === null || amount === OldAmount
                  if (amount === 0) {
                    return (
                      <>
                        <Button onClick={close} icon="undo">
                          Return
                        </Button>
                        <Button
                          id="add"
                          icon="add"
                          onClick={() => {
                            saveOldState(amount);
                            addItem(details);
                          }}
                        >
                          Add to order
                        </Button>
                      </>
                    );
                  }
                  return (
                    <>
                      <div className="orderButtons">
                        <Button
                          icon="remove"
                          onClick={() => {
                            saveOldState(amount);
                            removeItem(details);
                          }}
                        >
                          Remove
                        </Button>
                        <div className="amount">{amount}</div>
                        <Button
                          id="add"
                          icon="add"
                          onClick={() => {
                            saveOldState(amount);
                            addItem(details);
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <Button
                        onClick={() => {
                          if (isUnchanged) {
                            close();
                          } else {
                            setItem(details, OldAmount);
                          }
                        }}
                        icon="undo"
                      >
                        {isUnchanged ? "Return" : "Undo"}
                      </Button>
                      <Button icon="done" onClick={close}>
                        Confirm
                      </Button>
                    </>
                  );
                }}
              </BasketContext.Consumer>
            );
          }}
        </LocationContext.Consumer>
      </div>
    </div>
  );
};

export default OrderDetails;