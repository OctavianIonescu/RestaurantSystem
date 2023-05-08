import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import '../css/ConfirmAlert.css'; 

/**
 * Class for the creating a button to cancel an order.
 * 
 * @author Team21
 *
 */
class CancelOrder extends Component {
  submit = () => {
    confirmAlert({
      title: 'Confirm Cancellation',
      message: 'Are you sure you want to cancel this order?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => alert('Click Yes')
        },
        {
          label: 'No',
          onClick: () => alert('Click No')
        }
      ]
    });
  };

  render() {
    return (
      <div className='container'>
        <button onClick={this.submit}>Confirm dialog</button>
      </div>
    );
  }
}
export default CancelOrder;
