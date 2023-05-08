import React from "react";
import Collapsible from "react-collapsible";
import Button from "../../../Utilities/Button";
import "../../../css/OrderDetails.css"
/* This gets all the details for a menu item in the users current context */
const OrderDetails = ({ details, close }) => {
  const ingredientJoiner = (ingredient) =>
    ingredient.name + " " + ingredient.percentage + "%, ";
  const ingredientstoHtml = (ingredient) =>
    ingredient.isAllergen ? (
      <b key={ingredient.name}>{ingredientJoiner(ingredient)}</b>
    ) : (
      ingredientJoiner(ingredient)
    );
  return (
    <div className="lightbox">
      <div className="title">
        <h2>{details.name}</h2>
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
        <Button onClick={close} icon="undo">
          Return
        </Button>
      </div>
    </div>
  );
};

export default OrderDetails;