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
  const { min, max, steps, reversed, variant } = props;

  const sizeSteps = (stepMin, stepMax) => {
    const step = (stepMax - stepMin) / (steps - 1);
    const sizes = Array();
    for(let i = 0; i < steps; i++) {
      sizes.push(stepMin + (i * step));
    }
    return sizes;
  };

  let elements;

  if(variant === 'border') {
    elements = sizeSteps(2, 10).map(size => (
      <div className="size-swatch-border" style={{ 'border-width':size }} key={size} />
    ));
  } else if(variant === 'line') {
    elements = sizeSteps(2, 10).map(size => (
      <div className="size-swatch-line" style={{ 'border-left-width':size }} key={size} />
    ));
  } else if(variant === 'solid') {
    elements = sizeSteps(20, 40).map(size => (
      <div className="size-swatch-solid" style={{ width:size, height:size }} key={size} />
    ));
  } else if(variant === 'text') {
    elements = [
      <div key={1} style={{padding:'5px', fontSize:'x-small'}}>T</div>,
      <div key={2} style={{padding:'5px', fontSize:'small'}}>T</div>,
      <div key={3} style={{padding:'5px', fontSize:'medium'}}>T</div>,
      <div key={4} style={{padding:'5px', fontSize:'large'}}>T</div>,
      <div key={5} style={{padding:'5px', fontSize:'x-large'}}>T</div>,
    ];
  }

  return (
    <div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': _.isMatch(props.selected, reversed ? [max,min] : [min,max])
        })}
        onClick = {() => props.onSelect(reversed ? [max,min] : [min,max])}
        >
        { reversed ? elements.reverse() : elements }
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
  variant: PropTypes.oneOf(['solid', 'border', 'line', 'text']),
};
SizeGradient.defaultProps = {
  onSelect: () => null,
  min: 20,
  max: 40,
  steps: 5,
  variant: 'solid',
};


export function SizeGradients(props) {
  return <div>
    <SizeGradient {...props} />
    <SizeGradient reversed={true} {...props} />
  </div>;
}
SizeGradients.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.any,
  min: PropTypes.number,
  max: PropTypes.number,
  steps: PropTypes.number,
  variant: PropTypes.oneOf(['solid', 'border', 'line', 'text']),
};
SizeGradients.defaultProps = {
  onSelect: () => null,
  min: 20,
  max: 40,
  steps: 5,
  variant: 'solid',
};
