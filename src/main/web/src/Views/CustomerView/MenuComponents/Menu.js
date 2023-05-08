import React,{useEffect, useContext, useState} from "react";
import "../../../css/Menu.css";
import "../../../css/finalPage.css"
import Button from "../../../Utilities/Button";
import { getIcons , iconNames } from "../../../Utilities/Icons";
import LocationContext from "../../../Context/LocationContext";
import AuthContext from "../../../Context/AuthContext";
import Category from "./Category";
import FilterBar from "./FilterBar";
import EditMenu from "../../../Context/EditMenuContext";
import Popup from "../../../Context/PopupContext";
import BasketContext from "../../../Context/BasketContext";
import SockJsClient from 'react-stomp';

/**
 * This handles the menu and categories/order items inside it
 *
 * @param {*} {editable}
 * @return {*} 
 */
const Menu = ({editable})=>{
  const { isEditable, setEditable} = useContext(EditMenu);
  editable = editable ?? false;
  useEffect(() => {
    if (editable !== isEditable) {
      setEditable(editable);
    }
  }, [editable, setEditable, isEditable]);
  const [data, setdata] = useState(null);
  const [lastLocation, setlastLocation] = useState(undefined);
  const [failedToLoad, setFailedToLoad] = useState(false);
  const [updateRequested, setupdateRequested] = useState(false);
  const { location: authLocation, isAuthenticated } = useContext(AuthContext);
  const { location } = useContext(LocationContext);
  const { filter, classes, cats } = useContext(FilterContext);
  const {items:tmpitems, setItem} = useContext(BasketContext)
  const basketItems = Object.values(tmpitems);

  /**
   * Handles formatting of menu and shows error messages if the menu is empty or not visible
   *
   * @return {*} 
   */
  const formatData = () => {
    if (data === null) {
      return (<p>the menu hasn't loaded...</p>)
    }
    if(data.length === 0){
      return (<p>Sorry there are no items on the menu at this location</p>)
    }
    const output = data.map(cat=>{
      return { ...cat, items: cat.items.filter(filter)};
    }).filter(cat => cat.items.length > 0)
    if(output.length === 0){
      return (<p>Sorry we dont have any items that match your filter requirements</p>)
    }
    return output.map(dataToCategory)
  }
  if (failedToLoad){
    //when there has been an error retry in a second
    setTimeout(() => {
      setlastLocation(undefined);
    }, 1000);
    setFailedToLoad(false);
  }
  /**
   * POST request to API to retreive current menu
   *
   * @return {*} 
   */
  const requestMenu = ()=>{
    let req;
    if(editable && isAuthenticated) {
      req = fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: "getEditMenu",
          branchID: authLocation.branchID
        }),
      })
    } else if ((lastLocation !== location && location !== null) || updateRequested) {
      req = fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: "getSpecificMenu",
          branchID: location.branchID,
        }),
      })
    } else if (location === null) {
      req = fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: "getMenu" }),
      })
    } else {
    return;
  }

  req.then((res) => res.json()).then((res) => {
    setdata(res);
    checkBasket(res);
    setlastLocation(location);
  })
    .catch(() => {
      setdata(null);
      setlastLocation(null);
      setFailedToLoad(true);
    });
  }
  useEffect(requestMenu
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [location, lastLocation, editable, authLocation, isAuthenticated, updateRequested]);

  const checkBasket = data => {
    if (data !== null && basketItems.length > 0 && updateRequested) {
      const all = data.reduce((acc, cur) => acc.concat(cur.items), []);
      const removed = basketItems.filter(elm => !all.some(item => item.name === elm.name))
      removed.forEach(elm => {
        setItem(elm,0);
      })
      if (removed.length > 0) {
        setshowingRemovedItems(true);
      }
      
    }
    setupdateRequested(false);
  }


    /* renders category navigation bar with provided category names */
  const dataToNav = (cat) => (
      <a href={`#${cat.categoryName.toLowerCase()}`} key={cat.categoryName}>
        {cat.categoryName}
      </a>
    );
  /* sends menu data as param and renders category components with their order items */
  const dataToCategory = (cat) => (
    <Category
      categoryName={cat.categoryName}
      items={cat.items}
      key={cat.categoryName}
    />
  );
  //filter popup show controls
  const [showingPopup, setshowingPopup] = useState(false);
  const close = () => {
    setshowingPopup(false);
  }
  const openFilters = () => {
    setshowingPopup(true)
  };
  const update = branchID =>{
    if (!editable && branchID === location.branchID){
      setupdateRequested(true);
    }
  }
  const [showingRemovedItems, setshowingRemovedItems] = useState(false);
  //each category is a size responsive flex-container for all relevant order items
  return (
    <>
    <Popup
        action="left"
        showing={showingPopup}
        onOutsideClick={close}
    >
        <FilterBar close={close} />
    </Popup>
      <Popup
        showing={showingRemovedItems}
        onOutsideClick={() => { setshowingRemovedItems(false) }}
      >
        <div className="finalPage">
          <h2>Sorry,</h2>
          <p>unfortunately some of the items in your basket are no longer in stock</p>
          <div className="button-bar">
            <Button onClick={()=>{setshowingRemovedItems(false)}} icon="done">
              OK
            </Button>
          </div>
        </div>
      </Popup>
      <SockJsClient url={`${window.location.origin}/stomp`} topics={['/updatemenu']}
        onMessage={update} />
      <div className="menu">
        <nav className="category-bar">
          {data != null
            ? data.map(dataToNav)
            : ""}
          <span className="material-icons" onClick={openFilters}>
            filter_alt
              </span>
        </nav>
        <div className="category-container">
          {// eslint-disable-next-line react-hooks/exhaustive-deps
            React.useMemo(formatData, [data, classes, cats, filter])}
        </div>
      </div>
       </> );
}

export default Menu;

const FilterContext = React.createContext({
  filter: () => {},
  addClass: () => {},
  removeClass: () => {},
  addCat:()=>{},
  removeCat: () => { },
  reset: () => { },
  classes: [],
  cats:[],
});
class FilterContextProvider extends React.Component {
  constructor() {
    super();
    this.state = { classes: [], cats: iconNames };
  }
  addClass = (key) => {
    this.setState((old) => {
      old.classes = [...old.classes, key];
      return old;
    });
  };
  removeClass = (key) => {
    this.setState((old) => {
      old.classes = old.classes.filter((item) => item !== key);
      return old;
    });
  };
  addCat = (key) => {
    this.setState((old) => {
      old.cats = [...old.cats, key];
      return old;
    });
  };
  removeCat = (key) => {
    this.setState((old) => {
      old.cats = old.cats.filter((item) => item !== key);
      return old;
    });
  };
  filter = (val) => {
    const noRemovedClass = !val.types.some((each) => this.state.classes.includes(each));
    const hasIncludedCats = getIcons(val.name, val.types).every(each => this.state.cats.includes(each.name))
    return noRemovedClass && hasIncludedCats;
  };
  reset = () => {
    this.setState((old) => {
      return { ...old, classes: [], cats: iconNames };
    });
  };
  render() {
    return (
      <FilterContext.Provider
        value={{
          filter: this.filter,
          addClass: this.addClass,
          removeClass: this.removeClass,
          classes: this.state.classes,
          cats: this.state.cats,
          addCat: this.addCat,
          removeCat: this.removeCat,
          reset: this.reset,
        }}
      >
        {this.props.children}
      </FilterContext.Provider>
    );
  }
}
export { FilterContext, FilterContextProvider };