import { useContext } from 'react';
import LocationContext from '../../../Context/LocationContext';
import BasketContext from '../../../Context/BasketContext';
import OptionSelect from './OptionSelect';


/**
 * component to offer a selection of restaurants
 *
 * @class SelectRestaurant
 * @extends {OptionSelect}
 */
class SelectRestaurant extends OptionSelect {
  /**
   * 
   * @param {object} props this gives the user an option for which restaurant the user can chose to dine in
   */
  constructor(props) {
    super();
    //select how to get the available options
    this.getOptions = fetch("/api/location", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: 'getRestaurants' })
    }).then(data => data.json())

    //called when the selection has been made
    this.confirm = (selected) => {
      props.locationContext.setLocation({branchID:selected.key,name:selected.description});
    };
    this.loadingString = "Loading locations";
    this.promptString = "Please select your location";
  }
}
const Wrapper = (props)=>{
	return (<SelectRestaurant {... props} locationContext={useContext(LocationContext)} basketContext={useContext(BasketContext)}/>);

}
export default Wrapper;