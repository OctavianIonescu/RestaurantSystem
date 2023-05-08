import React from 'react';
import BasketContext from './BasketContext';
/**
 * Creates a context for the location of the restaurant
 * 
 *  @type {*} */
const LocationContext = React.createContext({ location: {}, setLocation: () => { } })
export default LocationContext;

/**
 * Class that manages the location of the customer/staff.
 * Stores location in local storage
 *
 * @class LocationContextProvider
 * @extends {React.Component}
 */
class LocationContextProvider extends React.Component {
	constructor() {
		super();
		const lsData = localStorage.getItem("location");
		if(lsData === null){
			this.state = { data: null };
		}else{
			this.state = { data:JSON.parse(lsData)};
		}
		
	}
	setLocation = location => this.setState(state => { return { ...state, data: location } });
	render() {
		return (
			<BasketContext.Consumer>
				{({ clearItems }) => {
					const emptyBasket = location =>{
						clearItems();
						localStorage.setItem("location",JSON.stringify(location));
						this.setLocation(location);
					}
					return (
						<LocationContext.Provider value={{ location: this.state.data, setLocation: emptyBasket }}>
							{this.props.children}
						</LocationContext.Provider>
					);
				}}
			</BasketContext.Consumer>
		);
	}
}

export { LocationContextProvider };
