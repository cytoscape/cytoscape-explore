import React, { Component } from 'react';

const defaults = {
  title: "Visual Property"
}

export class StylePicker extends Component {

  constructor(props){
    super(props);
    this.state = Object.assign({}, defaults, props);
  }

  render() {
    const { title } = this.props;

    return (
      <div className="style-picker"> 
        <div className="style-picker-heading">
          {title}
        </div>
        <div className="style-picker-body">
          {this.props.children}
        </div>
        <div className="style-picker-bottom">
          <button className="style-picker-button">
            Add to legend
          </button>
        </div>
      </div>
    );
  }

}

export default StylePicker;