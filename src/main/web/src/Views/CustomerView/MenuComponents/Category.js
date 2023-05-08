import React from 'react';
import '../../../css/Category.css';
import OrderItem from './OrderItem';

/**
 * Represents a collection of order items, e.g. mains or desserts 
 *
 * @class Category
 * @extends {React.Component}
 */
class Category extends React.Component {

	/**
	 * 
	 * @param {object} elm Describes a set of order objects, such as main courses or desserts.
	 * 						The render function is used to construct each order item component.
	 */

	/* called by the render functon to create each individual order item component */
	dataToitems = elm => <OrderItem {...elm} key={elm.name+elm.price} />;

	/* renders all category sections with the relevant order item components inside */
	render() {
		//uses menu data passed by the calling class to render menu
		return (
			<div className="category" id={this.props.categoryName.toLowerCase()} >
				<h2>{this.props.categoryName}</h2>
				<div>
					{this.props.items.map(this.dataToitems)}
				</div>
			</div>
		);


	}
}
export default Category;