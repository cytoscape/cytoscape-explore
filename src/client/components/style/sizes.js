import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Slider } from '@material-ui/core';

export function SizeSlider(props) {
  const debouncedOnChange = _.throttle(value => props.onSelect(value), 150, { leading: true });
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
  const { min, max, steps } = props;

  const sizeSteps = (stepMin, stepMax) => {
    const step = (stepMax - stepMin) / (steps - 1);
    const sizes = Array();
    for(let i = 0; i < steps; i++) {
      sizes.push(stepMin + (i * step));
    }
    return sizes;
  };

  let circles, reversed;

  if(props.variant === 'border') {
    const sizes = sizeSteps(2, 10);
    circles = sizes.map(size => (
      <div className="size-swatch-border" style={{ 'border-width':size }} key={`size-swatch-${size}`}/>
    ));
    reversed = sizes.reverse().map(size => (
      <div className="size-swatch-border" style={{ 'border-width':size }} key={`size-swatch-r-${size}`}/>
    ));
  } else if(props.variant === 'line') {
    const sizes = sizeSteps(2, 10);
    circles = sizes.map(size => (
      <div className="size-swatch-line" style={{ 'border-left-width':size }} key={`size-swatch-${size}`}/>
    ));
    reversed = sizes.reverse().map(size => (
      <div className="size-swatch-line" style={{ 'border-left-width':size }} key={`size-swatch-r-${size}`}/>
    ));
  } else { // 'solid'
    const sizes = sizeSteps(20, 40);
    circles = sizes.map(size => (
      <div className="size-swatch-solid" style={{ width:size, height:size }} key={`size-swatch-${size}`}/>
    ));
    reversed = sizes.reverse().map(size => (
      <div className="size-swatch-solid" style={{ width:size, height:size }} key={`size-swatch-r-${size}`}/>
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
  steps: PropTypes.number,
  variant: PropTypes.oneOf(['solid', 'border', 'line']),
};

SizeGradients.defaultProps = {
  onSelect: () => null,
  min: 20,
  max: 40,
  steps: 5,
  variant: 'solid',
};
