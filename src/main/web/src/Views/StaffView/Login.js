import React, { Component } from 'react';
import '../../css/Header.css';
import '../../css/Login.css';
import LoginForm from './LoginForm';

/**
 * Allows user to login.
 *
 * @class Login
 * @extends {Component}
 */
class Login extends Component {

    /**
     *@param {object} Login this allows the waiter or managers to enter thier credentials.
     */

    render() {
        return (
            <div className="App">
                <div className="header"><h1>Welcome to Oaxaca</h1></div>
                <div className="loginArea">
                    <h3 style={{textAlign:"center"}}>Enter your details for your Oaxaca employee account</h3>
                    <div> 
                <LoginForm referrer={this.props.location.state?.referrer ??"/manager"}/>
                    </div>
                </div>
            </div>
        );
    }

}

export default Login
