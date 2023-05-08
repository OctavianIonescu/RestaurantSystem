import React, { Component } from 'react';
import '../../../css/FilterBar.css';
import { mealFilterOpts } from "../../../Utilities/Icons";
import Button from '../../../Utilities/Button';
import { FilterContext } from './Menu';

/**
 * This component renders the filter bar and gets the new filtered menu 
 *
 * @class FilterBar
 * @extends {Component}
 */
class FilterBar extends Component {
	constructor() {
		super()
		this.state = {};
		this.state.data = FilterBar.data;
	}
	/**
	 * Sends request to backend to get the filtering options available to the customer.
	 *
	 * @static
	 * @memberof FilterBar
	 */
	static data = null;
	componentDidMount() {
		if (FilterBar.data === null) {
			fetch("/api/menu", {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ request: 'getFilterTypes' })
			}).then(data => data.json()).then(res => {
				this.setState(state => {
					state.data = res
					FilterBar.data = res;
					return this.state;
				})
			}).catch(() => {
				this.setState(state => {
					state.data = null;
					FilterBar.data = null;
					return this.state;
				})
			});
		}

	}
	render() {
		return (
			<FilterContext.Consumer>
				{({ addClass, removeClass, addCat, removeCat, cats, classes, reset }) => {
					const dataToFilterBar = opt => {
						const combOpts = cats.concat(classes);
						return (
							<div key={opt.key}>
								<input
									onChange={handleChange}
									name={opt.key}
									id={opt.key}
									type="checkbox"
									checked={combOpts.includes(opt.key)}
								/>
								<label htmlFor={opt.key}>{opt.description}</label>
							</div>

						);
					}
					const handleChange = e => {
						let key = parseInt(e.currentTarget.id);
						if (isNaN(key)) {
							key = e.currentTarget.id;
							if (e.currentTarget.checked) {
								addCat(key);
							} else {
								removeCat(key);
							}
						} else {
							if (e.currentTarget.checked) {
								addClass(key);
							} else {
								removeClass(key);
							}
						}

					}
					const submit = () => {
						this.props.close();
					}
					return (
						<div className="filter-bar">
							<form className="filters" action="#" onSubmit={e => e.preventDefault()}>
								<h3>include meals from categories:</h3>
								<div className="opts">
									{mealFilterOpts.map(dataToFilterBar)}
								</div>
								<h3>remove items that contain:</h3>
								<div className="opts">
									{this.state.data != null ? this.state.data.map(dataToFilterBar) : 'loading...'}
								</div>
								<div className="button-bar">
									<Button type="submit" icon="undo" onClick={reset}>undo</Button>
									<Button type="submit" icon="done" onClick={submit}>Apply</Button>
								</div>
							</form>

						</div>
					);
				}}
			</FilterContext.Consumer>


		);
	}
}
export default FilterBar;