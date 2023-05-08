import React, { useEffect, useContext, useState } from 'react';
import '../css/PopupTarget.css';
const PopupContext = React.createContext({ showPopUp: () => { }, hidePopUp: () => { }, currentPopup: -1 })

/**
 * This is a context proivder for managing the Popups ensuring that only one of
 * them is open at once. 
 * @param {*} children the children that will belong to this context  
 * @returns the children wrapped by this context provider.
 */
const PopupTarget = ({ children }) => {
  const [popupBacklog, setpopupBacklog] = useState([]);
  const [currentPopup, setcurrentPopup] = useState(-1);
  //show a popup after a render where there are no popups being shown but there
  // are popups wating to be shown
  useEffect(() => {
    if (currentPopup < 0 && popupBacklog.length !== 0) {
      setpopupBacklog(old => {
        setcurrentPopup(old.shift());
        return old;
      });
    }
  }, [currentPopup, popupBacklog.length]);
  const showPopUp = key => {
    setpopupBacklog(old => [...old, key]);
  }
  const hidePopUp = (key) => {
    if (currentPopup >= 0 && currentPopup === key) {
      setcurrentPopup(-1)
    }
  }
  return (
    <PopupContext.Provider value={{ showPopUp, hidePopUp, currentPopup }}>
      {children}
    </PopupContext.Provider>
  );
}

let popupCount = 0;

/**
 * A Element that will display it child a-s a popup
 *
 * @param {*} { showing, children, animationDuration: animationDurationProp, action: actionProp, onOutsideClick, onClosed }
 * @return {*} the pop up
 */
const Popup = ({ showing, children, animationDuration: animationDurationProp, action: actionProp, onOutsideClick, onClosed }) => {
  const { showPopUp, hidePopUp, currentPopup } = useContext(PopupContext);
  const animationDuration = animationDurationProp ?? 250;
  const action = actionProp ?? "center"; // default position is centre 
  /**
   * unique key for each popup
   */
  const [key, setkey] = useState(null);
  /**
   *  is the popup suposed to be static on the screen
   */
  const [show, setshow] = useState(false);
  /**
   * is the popup supposed to be on the screen at all avoid having a number of hidden popups on the screen 
   */
  const [display, setdisplay] = useState(false); 
  /**
   * is the popup waiting to be shown (so we don't repetedly call show pupup untill it is )
   */
  const [waiting, setwaiting] = useState(false);
  useEffect(() => {
    if (key === null) {
      //if this is the first time get a unuqe key
      setkey(popupCount++);
    }
    if (!show && showing && !waiting) {
      //if not showing and should be 
      // and not waiting to be shown
      setwaiting(true);
      showPopUp(key);
      //request to be shown and start waiting 
    }

    if (key === currentPopup && !show && showing) {
      // if been picked your not waiting 
      // and show yourself 
      setwaiting(false);
      setdisplay(true);
      setshow(true);
    }
    if (show && !showing) {
      //if we have been told to stop showinf 
      setshow(false);
      //stop showing 
      setTimeout(() => {
        //once the animation has finnished
        //stop displaying  
        setdisplay(false);
        hidePopUp(key);
        setkey(popupCount++);
        // get new key  to avoid future race condition

        // let the parent know the popup has just closed so they can realese 
        // resources
        if (onClosed && typeof (onClosed) == "function") {
          onClosed();
        }
      }, animationDuration);
    }
  }, [show, showing, showPopUp, animationDuration, hidePopUp, onClosed, key, currentPopup, waiting]);
  
  // cleanup function
  // if the popup was showing but unmounted then it should be closes for the 
  // next page.
  useEffect(() => {
    return () => {
      if (show || display) {
        hidePopUp(key);
      }
    }
  })
  /* renders the the popup target */
  const callClose = e => {
    if (e.target === e.currentTarget && onOutsideClick && typeof (onOutsideClick) === "function" && show) {
      onOutsideClick();
    }
  }
  if (display) {
    return (
      <div className={`popup-target ${show ? 'shown' : 'hidden'} ${action}`} onClick={callClose}>
        {children}
      </div>
    );
  }
  else {
    return null;
  }
}
export default Popup;
export { PopupTarget };