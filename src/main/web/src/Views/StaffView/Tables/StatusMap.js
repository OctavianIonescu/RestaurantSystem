import { createContext, useState, useContext, useEffect } from "react"
import AuthContext from "../../../Context/AuthContext"

const StatusContext = createContext({
  tableData: [],
  applyAction: tableNumber => { },
  getStatus: () => { },
  getAction: () => { },
  getDesc: () => { },
  getNextState: () => { },
  refresh: () => { }
})

const StatusContextProvider = ({ children }) => {
  const [needData, setneedData] = useState(true);
  const [tableData, settableData] = useState([]);
  const { location } = useContext(AuthContext);
  const statusMapping = {
    "table_empty": {
      "name": "available",
      "description": "The table is free for customers to use.",
      "action": null,
      "next": "order_requested"
    },
    "order_requested": {
      "name": "order sent",
      "description": "A order has been sent to the kitchen, the meal is being cooked.",
      "action": null,
      "next": "meal_ready_for_delivery"
    },
    "meal_ready_for_delivery": {
      "name": "order ready",
      "description": "the kitchen has completed this order, it needs to be delivered.",
      "action": "Delivered",
      "next": "meal_delivered"
    },
    "meal_delivered": {
      "name": "received order",
      "description": "The customers have received the order but we haven't checked they are happy with it.",
      "action": "Checked customer",
      "next": "meal_confirmed"
    },
    "meal_confirmed": {
      "name": "order checked",
      "description": "the customers have received the order and they are happy with it.",
      "action": "Cleaned table",
      "next": "table_clear"
    },
    "table_clear": {
      "name": "table clear",
      "description": "The plates have been cleared from the table. ",
      "action": "pay",
      "next": "table_empty"
    }
  }
  const refresh = () => {
    if (causedRefresh) {
      setcausedRefresh(false);
    } else {
      setneedData(true);
    }
  }
  const pickMostImportant = state => state.reduce((acc, cur) => {
    if (cur.order < acc.order) {
      return cur;
    } else {
      return acc;
    }
  }, { order: 1000 })
  const mapMostImportant = old => {
    return { ...old, state: pickMostImportant(old.state).name }
  }
  useEffect(() => {
    if (needData) {
      fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: "getTableStatus",
          branchID: location.branchID
        })
      }).then((res) => res.json()).then(res => {
        setneedData(false);
        settableData(res.map(mapMostImportant));
      }).catch(() => {
        setneedData(false);//prevent immedate retry 
        setTimeout(() => {
          setneedData(true);
        }, 1000);//retry after a second
      })
    }
  })
  const retryAction = (tableNumber, state) => {
    setcausedRefresh(false);
    setTimeout(() => {
      applyAction(tableNumber, state);
    }, 200);
  }
  const [causedRefresh, setcausedRefresh] = useState(false);
  const applyAction = (tableNumber, state) => {
    const frontEndApply = () => {
      settableData(data => {
        return data.map(table => {
          if (table.number === tableNumber) {
            table.state = state;
            if (state === "table_empty") {
              table.staff_username = null;
              table.staff_firstname = null;
              table.staff_lastname = null;
            }
            return table;
          } else {
            return table;
          }
        })
      })
    }
    if (state === "table_empty") {
      frontEndApply();
      return;
    }
    setcausedRefresh(true);//dont need to refresh if it was our own request
    fetch("/api/updatestatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchID: location.branchID,
        number: tableNumber,
        state: state
      })
    }).then(response => {
      if (response.ok) {
        frontEndApply();
      } else {
        retryAction(tableNumber, state);
      }
    }
    ).catch(() => {
      retryAction(tableNumber, state);
    })

  }
  const getStatus = state => statusMapping[state].name
  const getAction = state => statusMapping[state].action
  const getDesc = state => statusMapping[state].description
  const getNextState = state => statusMapping[state].next
  return (
    <StatusContext.Provider
      value={{
        tableData,
        applyAction,
        getStatus,
        getAction,
        getNextState,
        getDesc,
        refresh
      }}
    >
      {children}
    </StatusContext.Provider>
  );
}
export default StatusContext;
export { StatusContextProvider }
