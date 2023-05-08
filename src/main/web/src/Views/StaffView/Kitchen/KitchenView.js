import React, { useState, useEffect, useContext } from 'react';
import "../../../css/Kitchen.css";
import AuthContext from "../../../Context/AuthContext";
import Order from "./Order";
import SockJsClient from 'react-stomp';

const KitchenView = () => {
  const [doing, setdoing] = useState(null);
  const [done, setdone] = useState(null);
  const [needData, setneedData] = useState(true);
  const { location } = useContext(AuthContext);
  const retry = () => {
    setTimeout(() => {
      setneedData(true);
    }, 1000);//retry after a second
  }
  const splitdata = (acc, cur) => cur.doing ? { done: acc.done, doing: [...acc.doing, cur] } : { done: [...acc.done, cur], doing: acc.doing }
  useEffect(() => {
    if (needData) {
      setneedData(false);
      fetch("/api/kitchenorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: location.branchID.toString()
      }).then(res => {
        if (res.ok) {
          res.json().then(data => {
            const { doing, done } = data.reduce(splitdata, { doing: [], done: [] })
            setdoing(doing);
            setdone(done);
          })
        } else {
          retry();
        }
      }).catch(() => {
        retry();
      })
    }
  }, [location.branchID, needData]);
  const update = ()=>{
    setneedData(true);
  }
  const toRow = order => <Order key={order.orderID} {...order} />
  const allLoaded = doing !== null && done !== null
  return (
    <div className="kitchen">
      <SockJsClient url={`${window.location.origin}/stomp`} topics={['/update']}
        onMessage={update} />
      {allLoaded || (
        <h2>Orders are loading...</h2>
      )}
      {allLoaded && (
        <>
          <div className="kitchen-orders">
            <h2> Orders to make: </h2>
            <div className="order-section doing">
              {doing.map(toRow)}  
            </div>
          </div>
          <div className="kitchen-orders done">
            <h2> Orders ready: </h2>
            {done.map(toRow)}
          </div>
        </>
      )
      }
    </div>

  );

}
export default KitchenView;
