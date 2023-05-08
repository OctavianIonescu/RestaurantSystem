import React, { useRef, useState, useContext} from 'react';
import { Redirect } from "react-router-dom"
import '../../css/Login.css';
import AuthContext from "../../Context/AuthContext";


/**
 * renders login form and redirects to employee interface when submitted
 *
 * @param {*} { referrer }
 */
const LoginForm = ({ referrer}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [redirectToReferrer, setRedirectToReferrer] = useState(false);
  const [message, setmessage] = useState(null);
  const { provideCredentials } = useContext(AuthContext);
  const user = useRef(null);
  const pass = useRef(null);

  /* called when user clicks submit */
  const submitHandler = (event) => {
    /*when you log in it needs to return location of the user */
    /*give username/password*/
    /*location, messager return <-message is error */
    /*set location context as location */
    event.preventDefault();
    provideCredentials(user.current.value, pass.current.value).then(val=>{
      if (val.isAuthenticated){
        setRedirectToReferrer(true) /*referrer needs to be page it tried to log in to, otherwise manager page */
      }else{
        setmessage(val.message);
      }
    })
    
    
  }

  if (redirectToReferrer && isAuthenticated) {
    return <Redirect to={referrer} />
  }
  return (

    <form onSubmit={submitHandler}>
      {message!== null?(<p>{message}</p>):''}
      <label>Username:</label>
      <input
        ref={user}
        type='text'
        name='username'
      />
      <label>Password:</label>
      <input
        ref={pass}
        type='password'
        name='password'
      />
      <input
        type='submit'
      />
    </form>
  );
}

export default LoginForm
