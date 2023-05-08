import Button from "../../../Utilities/Button";
import "../../../css/TableStatus.css";
import StatusContext from "./StatusMap";
import { useContext, useState } from "react";

const BottomBar = ({ isChanged, back, confirm }) => {
  if (isChanged) {
    return (
      <div className="button-bar">
        <Button onClick={back} icon="undo">
          Undo
        </Button>
        <Button onClick={confirm} icon="done">
          Confirm
          </Button>
      </div>
    );
  }
  return (
    <div className="button-bar">
      <Button onClick={back} icon="undo">
        Return
      </Button>
    </div>
  );
}

const TableStatus = ({ close, table, askForPayment }) => {
  const { getStatus, getAction, applyAction, getNextState, getDesc } = useContext(StatusContext);
  const [tableState, settableState] = useState(table.state);
  const isChanged = tableState !== table.state
  const getActionButton = (close) => {
    const act = getAction(tableState)

    if (act === null) {
      return (
        <div className="button-bar">
          <Button onClick={close} icon="undo">
            Return
        </Button>
        </div>
      )
    }
    const back = () => {
      if (isChanged) {
        settableState(table.state)
      } else {
        close();
      }
    }
    const confirm = () => {
      applyAction(table.number, tableState);
      close();
    }
    if (act === "pay") {
      return (
        <>
          <div className="button-bar">
            <Button onClick={() => {
              if (isChanged) {
                applyAction(table.number, tableState);
              }
              askForPayment();
            }} icon="arrow_forward_ios">
              take payment
            </Button>
          </div>
          <BottomBar isChanged={isChanged} back={back} confirm={confirm} />
        </>
      );
    }
    return (
      <>
        <div className="button-bar">
          <Button onClick={() => { settableState(old => getNextState(old)) }} icon="arrow_forward_ios">
            {act}
          </Button>
        </div>
        <BottomBar isChanged={isChanged} back={back} confirm={confirm} />
      </>
    );
  }
  return (
    <div className="table-status">
      <div className="header-bar">
        <h1>Table {table.number}</h1>
        <p>{getStatus(tableState)}</p>
      </div>
      {table.staff_firstname !== null ? (<p>host: {table.staff_firstname} {table.staff_lastname}</p>) : null}
      <p>{getDesc(tableState)}</p>
      {getActionButton(close)}


    </div>
  );
}

export default TableStatus;