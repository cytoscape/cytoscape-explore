import React, { Component } from 'react';

const pages = {
  VALUE: 1,
  ATTRIBUTE: 2,
  MAPPING: 3
}

export class StylePicker extends Component {

  constructor(props){
    super(props);
    this.controller = props.controller;
    this.elements = props.elements;
    this.state = {
      title: props.title || "Visual Property",
      page: pages.VALUE
    };
  }

  onShow(){
    this.setState({ page: pages.VALUE });
  }

  _getAttributes() {
    const attrNames = new Set();
    const nodes = this.controller.cy.nodes();
    nodes.forEach(n => {
      const attrs = Object.keys(n.json().data);
      attrs.forEach(a => attrNames.add(a));
    });
    return Array.from(attrNames);
  }

  render() {
    switch(this.state.page) {
      case pages.VALUE:     return this.renderValuePage();
      case pages.ATTRIBUTE: return this.renderAttributePage();
      case pages.MAPPING:   return this.renderMappingPage();
    }
  }

  renderHeader() {
    return (
      <div className="style-picker-heading">
        {this.props.title}
      </div>
    );
  }

  renderValuePage() {
    return (
      <div className="style-picker"> 
        {this.renderHeader()}
        <div className="style-picker-body">
          {this.props.valuePicker}
        </div>
        <div className="style-picker-bottom">
          <button className="style-picker-button" 
            onClick={ () => this.setState({ page: pages.ATTRIBUTE}) }>
            Next
          </button>
        </div>
      </div>
    );
  }

  renderAttributePage() {
    const attributes = this._getAttributes();

    return (
      <div className="style-picker"> 
        {this.renderHeader()}
        <div className="style-picker-body">
          { attributes.map(attr => 
            <div>
              {attr}
            </div>
          )}
        </div>
        <div className="style-picker-bottom">
          <button className="style-picker-button" 
            onClick={ () => this.setState({ page: pages.MAPPING }) }>
            Next
          </button>
        </div>
      </div>
    );
  }

  renderMappingPage() {
    return (
      <div className="style-picker"> 
        {this.renderHeader()}
        <div className="style-picker-body">
          {this.props.mappingPicker}
        </div>
        <div className="style-picker-bottom">
          <button className="style-picker-button" 
            onClick={ () => this.setState({ page: pages.VALUE}) }>
            Next
          </button>
        </div>
      </div>
    );
  }

}

export default StylePicker;