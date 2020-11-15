import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Slider } from '@material-ui/core';

export function SizeSlider(props) {
  const debouncedOnChange = _.debounce(value => props.onSelect(value), 150);
  const min = props.min || 1;
  const max = props.max || 100;
  const def = props.defaultValue || (max / 2.0);
  const marks = [ { value: min, label: min }, { value: max, label: max } ];
  return (
    <div className="size-slider">
      <Slider 
        min={min} 
        max={max} 
        defaultValue={def}
        marks={marks}
        valueLabelDisplay='auto'
        onChange={(event,value) => debouncedOnChange(value)}
      />
    </div>
  );
}

SizeSlider.propTypes = {
  defaultValue: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  onSelect: PropTypes.func
};


export function SizeGradients(props) {
  // TODO this code is pretty hackey
  const min = props.min || 20;
  const max = props.max || 40;

  const steps = 5;
  const step = (max - min) / (steps - 1);
  const sizes = Array();
  for(let i = 0; i < steps; i++) {
    sizes.push(min + (i * step));
  }

  let circles, reversed;

  if(props.border) {
    circles = sizes.map(size => (
      <div className="size-swatches-border" style={{ 'border-width':size }} key={`circle-${size}`}/>
    ));
    reversed = sizes.reverse().map(size => (
      <div className="size-swatches-border" style={{ 'border-width':size }} key={`circle-rev-${size}`}/>
    ));
  } else {
    circles = sizes.map(size => (
      <div className="size-swatches-circle" style={{ width:size, height:size }} key={`circle-${size}`}/>
    ));
    reversed = sizes.reverse().map(size => (
      <div className="size-swatches-circle" style={{ width:size, height:size }} key={`circle-rev-${size}`}/>
    ));
  }

  return (
    <div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': _.isMatch(props.selected, {styleValue1:min, styleValue2:max})
        })}
        onClick = {() => props.onSelect({styleValue1:min, styleValue2:max})}
        >
        {circles}
      </div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': _.isMatch(props.selected, {styleValue1:max, styleValue2:min})
        })}
        onClick = {() => props.onSelect({styleValue1:max, styleValue2:min})}
        >
        {reversed}
      </div>
    </div>
  );
}

SizeGradients.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.any,
  min: PropTypes.number,
  max: PropTypes.number,
  border: PropTypes.bool,
};