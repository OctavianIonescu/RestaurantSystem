import React, { useContext } from 'react';
import { Route, Switch, Redirect, Link } from "react-router-dom"
import '../../css/Header.css';
import '../../css/Manager.css';
import Tables from './Tables/TableView';
import EditableMenu from './EditableMenu';
import KitchenView from './Kitchen/KitchenView';
import AuthContext from "../../Context/AuthContext";
import Button from '../../Utilities/Button';

/*  */
  /**
   * Represents the manager view and its inner components at different sub-routes
   *
   * @return {*} 
   */
const Manager = () => {
  const { logout, firstName, lastName, location, isManager } = useContext(AuthContext);
  //header component to be replaced with a waiterHeader class
  //default route manager redirects to the tables view
  //navigation bar allows user to go to the edit menu or kitchen view
  return (
    <div className="manager hidden">
      <div className="header">
        <h2>Hello {firstName} {lastName}</h2>
        <h1>Oaxaca in {location.name}</h1>
        <Button onClick={logout}>Logout</Button>
      </div>
      <div className="manager-interface">
        {
          isManager && (
            <nav className="employee-navbar">
              <Link to="/manager/tables">Tables</Link>
              <Link to="/manager/kitchen">Kitchen</Link>
              <Link to="/manager/editmenu">Edit Menu</Link>
            </nav>
          )
        }
        {
          isManager || (
            <nav className="employee-navbar">
              <Link to="/waiter">Tables</Link>
              <Link to="/kitchen">Kitchen</Link>
            </nav>
          )
        }
        <div className="hidden-bar"></div>
        <div className="content">
          {
            isManager && (<Switch>
              <Route path="/manager/tables" component={Tables} exact/>
              <Route path="/manager/editmenu" component={EditableMenu} exact/>
              <Route path="/manager/kitchen" component={KitchenView} exact/>
              <Route path="/manager" render={() => {
                return (
                  <Redirect to="manager/tables" />
                )
              }} />
              <Route  path="/waiter" render={() => {
                return (
                  <Redirect to="/manager/tables" />
                )
              }} />
            </Switch>)
          }
          {
            isManager || (<Switch>
              <Route path="/waiter" component={Tables} />
              <Route path="/kitchen" component={KitchenView} />
              <Route path="/manager" render={() => {
                return (
                  <Redirect to="/waiter" />
                )
              }} />
            </Switch>)
          }
        </div>
      </div>
    </div>
  );
}
export default Manager;
