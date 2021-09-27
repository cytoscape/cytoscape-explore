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


export function SizeGradient(props) {
  const { min, max, steps, reversed } = props;

  const sizeSteps = (stepMin, stepMax) => {
    const step = (stepMax - stepMin) / (steps - 1);
    const sizes = Array();
    for(let i = 0; i < steps; i++) {
      sizes.push(stepMin + (i * step));
    }
    return sizes;
  };

  let circles;

  if(props.variant === 'border') {
    const sizes = sizeSteps(2, 10);
    if(!reversed) {
      circles = sizes.map(size => (
        <div className="size-swatch-border" style={{ 'border-width':size }} key={`size-swatch-${size}`}/>
      ));
    } else {
      circles = sizes.reverse().map(size => (
        <div className="size-swatch-border" style={{ 'border-width':size }} key={`size-swatch-r-${size}`}/>
      ));
    }
  } else if(props.variant === 'line') {
    const sizes = sizeSteps(2, 10);
    if(!reversed) {
      circles = sizes.map(size => (
        <div className="size-swatch-line" style={{ 'border-left-width':size }} key={`size-swatch-${size}`}/>
      ));
    } else {
      circles = sizes.reverse().map(size => (
        <div className="size-swatch-line" style={{ 'border-left-width':size }} key={`size-swatch-r-${size}`}/>
      ));
    }
  } else { // 'solid'
    const sizes = sizeSteps(20, 40);
    if(!reversed) {
      circles = sizes.map(size => (
        <div className="size-swatch-solid" style={{ width:size, height:size }} key={`size-swatch-${size}`}/>
      ));
    } else {
      circles = sizes.reverse().map(size => (
        <div className="size-swatch-solid" style={{ width:size, height:size }} key={`size-swatch-r-${size}`}/>
      ));
    }
  }

  return (
    <div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': _.isMatch(props.selected, [min, max])
        })}
        onClick = {() => props.onSelect([min, max])}
        >
        { circles }
      </div>
    </div>
  );
}

SizeGradient.propTypes = {
  reversed: PropTypes.bool,
  onSelect: PropTypes.func,
  selected: PropTypes.any,
  min: PropTypes.number,
  max: PropTypes.number,
  steps: PropTypes.number,
  variant: PropTypes.oneOf(['solid', 'border', 'line']),
};
SizeGradient.defaultProps = {
  onSelect: () => null,
  min: 20,
  max: 40,
  steps: 5,
  variant: 'solid',
};


export function SizeGradients(props) {
  return (
    <div>
      <SizeGradient {...props} />
      <SizeGradient reversed={true} {...props} />
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
