import React from 'react';
/**
 * Creates a context and sets the isEditable variable to false
 * 
 *  @type {*} */
const EditMenu = React.createContext({ isEditable: false, setEditable: () => { }, menuChange: null, setMenuChange: () => { } })
export default EditMenu;

/**
 * Class that manages whether the menu is editable or not
 *
 * @class EditMenuProvider
 * @extends {React.Component}
 */
class EditMenuProvider extends React.Component {
  constructor() {
    super();
    this.state = { isEditable: false, menuChange: null };


  }
  render() {
    const setEditable = edit => {
      this.setState(old => {
        const update = { ...old, isEditable: edit };
        return update
      }
      )
    }
    const setMenuChange = change => {
      this.setState(old => { 
        return { ...old, menuChange: change } 
      });
    }
    return (
      <EditMenu.Provider value={{
        isEditable: this.state.isEditable,
        setEditable,
        menuChange: this.state.menuChange,
        setMenuChange
      }}>
        {this.props.children}
      </EditMenu.Provider>
    );
  }
}

export { EditMenuProvider };
