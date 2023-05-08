import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter} from 'react-router-dom';
import './css/index.css';
import App from './App';

/**
 * Entry point of the UI, renders main App component according to URL route
 *
 * @class OptionSelect
 * @extends {Component}
 */
ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
  //renders app component into the root html section
);

