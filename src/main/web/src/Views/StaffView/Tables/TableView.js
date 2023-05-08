import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../../../Context/AuthContext"
import "../../../css/TableView.css"
import TableStatus from "./TableStatus";
import Popup from "../../../Context/PopupContext";
import StatusContext, { StatusContextProvider } from "./StatusMap";
import CheckoutForm from "../../../Utilities/CheckoutForm";
import SockJsClient from 'react-stomp';
import Button from "../../../Utilities/Button";

const TableView = () => {
  const { tableData, getStatus, applyAction, getNextState, refresh } = useContext(StatusContext);
  const { username, location } = useContext(AuthContext)
  const [getPayment, setgetPayment] = useState(false);
  const [selectedTable, setselectedTable] = useState(null);
  const [showingTableStatus, setshowingTableStatus] = useState(false);
  const [clearSelectedTable, setclearSelectedTable] = useState(false);

  const update = (branchID) => {
    if (branchID === location.branchID) {
      refresh();
    }
  }
  const showTableStatus = (table) => {
    setselectedTable(table)
    setshowingTableStatus(true);
  }
  const closeTableStatus = () => {
    setclearSelectedTable(true);
    setshowingTableStatus(false);
  }
  const onTableStatusClosed = () => {
    if (clearSelectedTable) {
      setselectedTable(null);
      setclearSelectedTable(false);
    }
  }
  const askForPayment = () => {
    setshowingTableStatus(false);
    setclearSelectedTable(false);
    setgetPayment(true);
  }
  const paymentSuccess = () => {
    applyAction(selectedTable.number, getNextState(selectedTable.state));
    setgetPayment(false);
    setselectedTable(null);
  }
  const undopayment = () => {
    setshowingTableStatus(true);
    setgetPayment(false);
  }
  useEffect(() => {
    tableData.forEach(table => {
      if (table.state === "meal_ready_for_delivery" && username === table.staff_username) {
        setdeliverTableNumber(table.number);
        setdeliverTable(true);
      }
    })
  }, [tableData, username]);
  const [deliverTable, setdeliverTable] = useState(false);
  const [deliverTableNumber, setdeliverTableNumber] = useState(0);
  const tableToRow = table => {
    return (
      <div
        className={`table ${table.state} ${username === table.staff_username ? null : 'grey'}`}
        key={table.number}
        onClick={() => { showTableStatus(table) }}
      >
        <b>{table.number}</b>
        <p>{getStatus(table.state)}</p>
      </div>)
  }
  return (
    <div className="table_view">
      <div className="titleBar"><h1>Tables</h1></div>

      <div className="tables">
        {tableData.length === 0 ? "table data is loading" : tableData.map(tableToRow)}
      </div>
      <Popup
        showing={deliverTable}
        onOutsideClick={() => { setdeliverTable(false) }}
      >
        <div className="finalPage">
          <h2>Order is ready</h2>
          <p>Order for table <b>{deliverTableNumber}</b> is ready to be delivered</p>
          <div className="button-bar">
            <Button onClick={() => { setdeliverTable(false) }} icon="done">
              OK
            </Button>
          </div>
        </div>
      </Popup>
      <Popup
        showing={showingTableStatus}
        onOutsideClick={closeTableStatus}
        onClosed={onTableStatusClosed}
      >
        <TableStatus close={closeTableStatus} table={selectedTable} askForPayment={askForPayment} />
      </Popup>
      <Popup
        showing={getPayment}
      >
        <CheckoutForm success={paymentSuccess} back={undopayment} tableNumber={selectedTable?.number} branchID={location.branchID} />
      </Popup>
      <SockJsClient url={`${window.location.origin}/stomp`} topics={['/update']}
        onMessage={update} />
    </div>
  );
}
const Wrapper = props => {
  return (
    <StatusContextProvider>
      <TableView {...props} />
    </StatusContextProvider>
  );
}

export default Wrapper;