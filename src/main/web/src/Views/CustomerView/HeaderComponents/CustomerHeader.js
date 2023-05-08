import React, { Component } from 'react';
import '../../../css/Header.css';
import OrderButton from './OrderButton';
import ConfirmButton from './ConfirmButton';
import LocationContext from '../../../Context/LocationContext';

/**
 * Represents the header object of the customer UI 
 *
 * @class CustomerHeader
 * @extends {Component}
 */
class CustomerHeader extends Component {

  /* renders the header */
  render() {

    return (
      <div className="header">
        <div><OrderButton /><ConfirmButton /></div>
        <LocationContext.Consumer>
          {({location}) => <h1>{location === null ? this.props.title : "Oaxaca in " + location.name}</h1>}
        </LocationContext.Consumer>
      </div>
    );
  }
}
export default CustomerHeader;