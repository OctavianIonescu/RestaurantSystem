import React, { Component } from 'react';
import '../css/icons.css';
import '../css/Button.css';

/**
 * base button class for consistency
 *
 * @class Button
 * @extends {Component}
 */
class Button extends Component {
  onClick(e) {
    e.preventDefault();
    this.props.onClick(e);
  }
  render() {
    if (this.props.onClick && typeof (this.props.onClick) == "function") {
      return (
        <button
          type="button" {...this.props}
          className={`button ${this.props.className ? this.props.className : ""}`}
          onClick={this.onClick.bind(this)}
        >
          {this.props.children}
          {this.props.icon &&
            <span className="material-icons">
              {this.props.icon}
            </span>}
        </button>
      )
    }
    return (
      <button
        type="button" {...this.props}
        className={`button ${this.props.className ? this.props.className : ""}`}
      >
        {this.props.children}
        {this.props.icon &&
          <span className="material-icons">
            {this.props.icon}
          </span>}
      </button>

    );
  }
}
export default Button;