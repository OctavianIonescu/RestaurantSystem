import BasketContext from '../../../Context/BasketContext';
import LocationContext from '../../../Context/LocationContext';
import OptionSelect from './OptionSelect';

import { useContext } from 'react';

/**
 * component to offer a selection of tables
 *
 * @class SelectTable
 * @extends {OptionSelect}
 */
class SelectTable extends OptionSelect {
  constructor(props) {
    super();
	//select how to get the available options
    this.getOptions = fetch("/api/location", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: 'getTables', branchID:props.locationContext.location.branchID})
      }).then(data => data.json()).then(data => {
        return data.map(row => { return { key: row, description: row } });
      })
      
    //called when the selection has been made
    this.confirm = (selected) => {
      this.props.basketContext.setTableNumber(selected.key);
	  };
	this.loadingString = "Getting available tables";
	this.promptString = "Please select your table";
  }
}

const Wrapper = (props)=>{
	return (<SelectTable {... props} locationContext={useContext(LocationContext)} basketContext={useContext(BasketContext)} />);
}
export default Wrapper;