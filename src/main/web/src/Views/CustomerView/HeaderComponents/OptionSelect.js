import React, { Component, useState } from 'react';
import '../../../css/SelectRestaurant.css';
import '../../../css/icons.css';
import Button from '../../../Utilities/Button';
import stringSimilarity from 'string-similarity';



/**
 * Component to offer a selection of restaurants.
 *
 * @class OptionSelect
 * @extends {Component}
 */
class OptionSelect extends Component {
  constructor() {
    super();
    this.state = { data: null, selected: null };
    this.setSearchString = this.setSearchString.bind(this);
    this.getRows = this.getRows.bind(this);
    this.getOptions = new Promise((res, rej) => {
      res(null);
    });
    this.loadingString = "loading";
    this.promptString = "please select an option";
  }


  /**
   * Gets the restaurant selection from the backend
   *
   * @memberof OptionSelect
   */
  componentDidMount() {
    this.getOptions.then(res => {
      this.setState(state => {
        state.data = res;
        return this.state;
      })
    }).catch(() => {
      this.setState(state => {
        state.data = null;
        return this.state;
      })
    });
  }
  /* called by the options when they are selected to update the selection */
  changeSelected = next => {
    this.state.selected?.unselect();
    this.setState(state => {
      state.selected = next;
      return state;
    });
  }
  rowToBranch = row => (<Option notify={this.changeSelected} data={row} key={row.key} />);
  //https://en.wikipedia.org/wiki/Levenshtein_distance
  //it's quite expensive and so are all the alternatives so i'm going to use a libary
  getRows = () => {
    if (!this.state.searchString) {
      return this.state.data.map(this.rowToBranch); //if there is no search don't filter any data 
    }
    //rank data due to relevence 
    let shortlist = this.state.data.map(row => {
      row.rank = stringSimilarity.compareTwoStrings(row.description.toString(), this.state.searchString);
      return row;
    }).sort((a, b) => b.rank - a.rank).filter(row => row.rank >= 0.10)
    if (shortlist.length === 0) {
      return this.state.data.map(this.rowToBranch); //nothing matches yet so give them every option 
    }
    return shortlist.map(this.rowToBranch);


  }
  setSearchString = str => {
    this.setState(state => {
      state.searchString = str;
      return state;
    });
  }

  callConfirm = () => {
    if (this.state.selected != null) {
      this.confirm(this.state.selected.data);
      this.props.close();
    }
  }

  render() {
    return (
      <div className="select-restaurant">
        <h2>{this.promptString}</h2>
        <Search setSearchString={this.setSearchString}></Search>
        <div className="options">
          {this.state.data != null ? this.getRows() : this.loadingString}
        </div>
        <div className="button-bar">
          <Button onClick={this.props.close} icon="undo">Return</Button>
          {this.state.selected === null?"":<Button onClick={this.callConfirm} icon="done">Confirm</Button>}
        </div>
      </div>
    );
  }
}
var Search = props => {
  const bar = React.createRef();
  const [hidden, updateHidden] = useState(true);
  const change = e => {
    props.setSearchString(bar.current.value);
    if (hidden ^ !bar.current.value) {
      updateHidden(!bar.current.value);
    }
  }
  const reset = () => {
    props.setSearchString("");
    bar.current.value = "";
  }
  return (
    <div className="search">
      <input className="search-input" placeholder="Search" type="text" ref={bar} onInput={change} />
      <span className={`material-icons ${hidden ? 'hidden' : ''}`} onClick={reset}>clear</span>
      <span className="material-icons" onClick={change}>search</span>
    </div>);
}
/* a class to represent the options that the user has access to */
class Option extends Component {
  constructor() {
    super();
    this.state = { selected: false };
    this.notify = this.notify.bind(this);
  }
  /* notifies the selection that there has been a change in selection */
  notify() {
    if (!this.state.selected) {
      this.setState(state => { return { selected: true } });
      this.props.notify({
        data: this.props.data, unselect: () => {
          this.setState(state => { return { selected: false } });
        }
      });
    }
  }



  render() {
    return (
      <div onClick={this.notify} className={`${this.state.selected ? 'selected' : ''}`}>{this.props.data.description}</div>
    );
  }
}
export default OptionSelect;