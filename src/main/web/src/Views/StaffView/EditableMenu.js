import Menu, { FilterContextProvider } from "../CustomerView/MenuComponents/Menu"
import { EditMenuProvider } from "../../Context/EditMenuContext"
import PopupTarget from "../../Context/PopupContext";


/**
 * Represents the menu at a branch with additional permissions to edit it in real time.
 * 
 * @param {object} EditableMenu Defines a branch's menu, with the ability to change it in real time.
 */

const EditableMenu = () => {
  return (
    <FilterContextProvider>
      <EditMenuProvider>
        <Menu editable={true} />
        <PopupTarget />
      </EditMenuProvider>
    </FilterContextProvider>
  );
}
export default EditableMenu;
