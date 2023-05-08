import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLeaf,
    faFish,
    faPepperHot,
    faDrumstickBite,
    faCheese,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
const icons = [
    { value: faLeaf, name: "vegetarian", included: [], excluded: [18, 11] },
    { value: faDrumstickBite, name: "meat", included: [18], excluded: [] },
    { value: faFish, name: "fish", included: [11], excluded: [] },
    { value: faCheese, name: "dairy", included: [3, 4, 9, 19], excluded: [] },
    {
        value: faPepperHot,
        name: "spice",
        included: [5, 23, 27],
        excluded: [],
    },
];
var mapping = {}
/**
 * gets the icons
 *
 * @param {*} name of icon
 * @param {*} types of icon
 * @return {*} the icon
 */
const getIcons = (name, types) => {
    if (mapping[name]) {
        return mapping[name];
    }
    const val = icons
        .filter((icon) => {
            return (
                icon.included.length === 0 ||
                icon.included.some((val) => {
                    return types.includes(val);
                })
            );
        })
        .filter((icon) => {
            return icon.excluded.every((val) => {
                return !types.includes(val);
            });
        });
    mapping[name] = val;
    return val;
};
/**
 * displays the icon
 *
 * @class MealIcons
 * @extends {React.Component}
 */
class MealIcons extends React.Component{
    iconToMarkup = (icon) => (
        <FontAwesomeIcon key={icon.name} icon={icon.value} />
    );
    
    render(){
        return(
            <div className="icons">{getIcons(this.props.name,this.props.types).map(this.iconToMarkup)}</div>
        );
    }
}

export default MealIcons;

const IconToFilter = icon => { 
    return{
        key: icon.name,
        description: (<div><FontAwesomeIcon icon={icon.value} />{icon.name}</div>)
    }
 }
const mealFilterOpts = icons.map(IconToFilter)
const iconNames = icons.map(icon=>icon.name)
export { mealFilterOpts, iconNames, getIcons}