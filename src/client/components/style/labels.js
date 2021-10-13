import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core';


export class LabelInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value };
    this.debouncedOnChange = _.debounce(value => this.props.onChange(value), 150);
  }

  handleInput(value) {
    this.setState({ value });
    this.debouncedOnChange(value);
  }

  render() {
    return (
      <div className="label-input">
        {"Label: "}{'\u00A0'}
        <TextField 
          value={this.state.value} 
          onChange={event => this.handleInput(event.target.value)} 
        />
      </div>
    );
  }
}
LabelInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};


// text-halign : The vertical alignment of a node’s label; may have value left, center, or right.
// text-valign : The vertical alignment of a node’s label; may have value top, center, or bottom.

export const LABEL_POS = {
  TOP:    { name:'TOP',    label:'TOP',    halign:'center', valign:'top'    },
  LEFT:   { name:'LEFT',   label:'LEFT',   halign:'left',   valign:'center' },
  CENTER: { name:'CENTER', label:'CENTER', halign:'center', valign:'center' },
  RIGHT:  { name:'RIGHT',  label:'RIGHT',  halign:'right',  valign:'center' },
  BOTTOM: { name:'BOTTOM', label:'BOTTOM', halign:'center', valign:'bottom' },
};

export function stylePropsToLabelPos(h, v) {
  for (const [key, {halign, valign}] of Object.entries(LABEL_POS)) {
    if(h == halign && v == valign) {
      return LABEL_POS[key];
    }
  }
}


export function PositionButton({ value, selected, onClick }) {
  const style = { cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' };
  if(selected)
    style.color = '#757ce8';
  return (
    <div onClick={() => onClick(value)} style={style}>
      <b>{value.label}</b>
    </div>
  );
}
PositionButton.propTypes = {
  value: PropTypes.oneOf(Object.values(LABEL_POS)),
  onClick: PropTypes.func,
  selected: PropTypes.bool
};
PositionButton.defaultProps = {
  onClick: () => null,
  selected: false
};


export class LabelPosition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }
  
  render() {
    const onSelect = (value) => {
      this.setState({ value });
      this.props.onSelect(value);
    };

    const PosButton = ({ pos }) => 
      <PositionButton value={pos} onClick={onSelect} selected={this.state.value == pos} />;
    
    return (
      <div style={{
          display:'grid',
          gridTemplateColumns:'auto auto auto',
          gridGap:'10px',
      }}>
        <div/>
        <PosButton pos={LABEL_POS.TOP} />
        <div/>  
        <PosButton pos={LABEL_POS.LEFT} />
        <div style={{
          borderRadius:'15px', 
          border:'2px solid #888', 
          padding:'10px', 
          width:'120px', 
          height:'60px',
          display:'flex', 
          alignItems:'center', 
          justifyContent:'center'
        }}>
          <PosButton pos={LABEL_POS.CENTER} />
        </div>
        <PosButton pos={LABEL_POS.RIGHT} />
        <div/>
        <PosButton pos={LABEL_POS.BOTTOM} />
        <div/>
      </div>
    );
  }
}
LabelPosition.propTypes = {
  value: PropTypes.oneOf(Object.values(LABEL_POS)),
  onSelect: PropTypes.func,
};



