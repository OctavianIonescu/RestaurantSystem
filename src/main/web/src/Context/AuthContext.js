import React, { useContext } from 'react';
import LocationContext from './LocationContext';
import { Redirect, Route } from "react-router-dom"
const AuthContext = React.createContext({
  provideCredentials: () => { },
  logout: () => { },
  isAuthenticated: false,
  username: undefined,
  firstName: undefined,
  lastName: undefined,
  location: {},
  isManager: undefined
})
export default AuthContext;

/**
 * Checks if a user is authenticated and sets 'isAuthenticated' to true or false appropriately
 *
 * @class AuthContextProvider component authorises a user
 * @extends {React.Component}
 */
class AuthContextProvider extends React.Component {
  constructor() {
    super();
    const lsData = localStorage.getItem("auth");
    if (lsData === null) {
      this.state = { isAuthenticated: false };
    } else {
      const jsonLsData = JSON.parse(lsData);
      this.state = jsonLsData;
      fetch("/api/checkloggedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:  jsonLsData.username
      }).then((response)=>{
        if(response.ok){
          response.json().then(res=>{
            if(res===true){
              this.setState({ ...jsonLsData,isAuthenticated:true}) ;
            }else{
              this.setState({ isAuthenticated: false });
            }
          })
        }
      })
    }

  }
  render() {
    return (
      <LocationContext.Consumer>
        {() => {
          //returns an object letting know if there is an error and the appropriate message 
          const provideCredentials = async (username, password) => {
            //hit endpoint with the user's details 
            const data = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password })
            }).then((res) => res.json()).then(res => {
              if ("message" in res) {
                logout();
                return {
                  isAuthenticated: false,
                  message: res.message
                }
              }
              this.setState(old => {
                const update = { ...res, isAuthenticated: true };
                localStorage.setItem("auth", JSON.stringify(update));
                return update;
              });
              return { isAuthenticated: true }
            }).catch(reason => {
              logout();
              return {
                isAuthenticated: false,
                message: "there was an error"
              }
            })
            return data;
          }
          /**
           * logs a user out of the system and sets 'isAuthenticated' to false
           *
           */
          const logout = () => {
            fetch("/api/logout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: this.state.username
            }).then(() => {
              this.setState(old => {
                const update = { isAuthenticated: false };
                localStorage.setItem("auth", JSON.stringify(update));
                return update;
              });
            })
          }
          return (
            <AuthContext.Provider value={{
              provideCredentials,
              logout,
              isAuthenticated: this.state.isAuthenticated,
              username: this.state.username,
              firstName: this.state.firstName,
              lastName: this.state.lastName,
              location: {
                branchID: this.state.location?.key,
                name: this.state.location?.description
              },
              isManager: this.state.isManager
            }}>
              {this.props.children}
            </AuthContext.Provider>
          );
        }}
      </LocationContext.Consumer>
    );
  }
}
/**
 * sets up a route for authenticated users to access waiter or manager pages
 *
 * @param {*} { component: Component, ...rest }
 * @return {*} 
 */
const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <Route {...rest} render={(props) => (
      isAuthenticated
        ? <Component {...props} />
        : <Redirect to={{
          pathname: '/login',
          state: { referrer: props.location }
        }} />
    )} />);
}
export { AuthContextProvider, PrivateRoute };
