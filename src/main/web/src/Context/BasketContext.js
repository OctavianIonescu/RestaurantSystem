import React from "react";
/** 
 * 
 * Creates a context to store items in the basket
 * */
const BasketContext = React.createContext({
  items: {},
  addItem: () => { },
  removeItem: () => { },
  setItem: () => { },
  tableNumber: -1,
  setTableNumber: () => { },
  clearItems: () => { },
  justClearItems: () => { },
  isEmpty: ()=>{}
});
export default BasketContext;
const setLSState = state => {
  localStorage.setItem("basket", JSON.stringify(state));
}

class BasketContextProvider extends React.Component {
  constructor() {
    super();
    const lsData = localStorage.getItem("basket");
    if(lsData == null){
      this.state = { items: {}, tableNumber: -1, itemsCount:0};
    }else{
      this.state = JSON.parse(lsData);
    }
  }
  
  /**
   * adds an item to the basket and increments quantity
   *
   * @param {*} details
   * @memberof BasketContextProvider
   */
  addItem = details =>
    this.setState((state) => {
      if (details?.name in state.items) {
        const oldAmount = state.items[details.name].quantity
        state.items[details.name] = {
          ...state.items[details.name],
          quantity: oldAmount + 1
        };
      } else {
        state.itemsCount += 1;
        state.items[details.name] = { ...details, quantity: 1 }
      }
      setLSState(state);
      return state;
    });

  setItem = (details, amount) => {
    this.setState((state) => {
      if (amount <= 0) {
        delete state.items[details?.name];
        state.itemsCount -= 1;
      } else {
        state.items[details.name] = {
          ...state.items[details.name],
          quantity: amount
        };
      }
      setLSState(state);
      return state;
    });
  };
  /**
   * Sets table number to customers table number
   *
   * @param {*} number
   * @memberof BasketContextProvider
   */
  setTableNumber = number => {
    this.setState(state => {
      state.tableNumber = number;
      setLSState(state);
      return state;
    });
  };
  /**
   * Removes item from basket
   *
   * @param {*} details
   * @memberof BasketContextProvider
   */
  removeItem = details =>
    this.setState((state) => {
      if (details?.name in state.items) {
        const oldAmount = state.items[details.name].quantity
        if (oldAmount > 1) {
          state.items[details.name] = {
            ...state.items[details.name],
            quantity: oldAmount - 1
          };
        } else {
          delete state.items[details?.name];
          state.itemsCount -= 1;
        }
      }
      setLSState(state);
      return state;
    });
  /**
   * Clears only the items from the basket
   *
   * @memberof BasketContextProvider
   */
  justClearItems = () => {
    this.setState(state => {
      state.items= {};
      state.itemsCount = 0;
      setLSState(state);
      return state;
    })
  }
  /**
   * Clears the table number as well as items
   *
   * @memberof BasketContextProvider
   */
  clearItems = () => {
    // clear the table as well
    this.setTableNumber(-1);
    this.justClearItems();
  }
  isEmpty = () => this.state.itemsCount <= 0
  render() {
    return (

      <BasketContext.Provider
        value={{
          items: this.state.items,
          addItem: this.addItem,
          removeItem: this.removeItem,
          tableNumber: this.state.tableNumber,
          setTableNumber: this.setTableNumber,
          setItem: this.setItem,
          clearItems: this.clearItems,
          justClearItems: this.justClearItems,
          isEmpty:this.isEmpty
        }}
      >
        {this.props.children}
      </BasketContext.Provider>
    );

  }
}

export { BasketContextProvider };