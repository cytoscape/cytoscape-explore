import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export function SizeSlider(props) {
  const debouncedChange = _.debounce(value => props.onSelect(value), 150);
  return (
    <input 
      type="range" 
      min="1" 
      max="100" 
      onChange={event => debouncedChange(event.target.value)} // have to get the value here synchronously
      defaultValue={props.size || 50} />
  );
}

SizeSlider.propTypes = {
  size: PropTypes.number,
  onSelect: PropTypes.func
};


export function SizeGradients(props) {
  // TODO this code is pretty hackey
  const sizes = [20, 25, 30, 35, 40];
  const circles = sizes.map(size => (
    <div key={`size-swatches-circle-${size}`} className="size-swatches-circle" style={{ width:size, height:size }}></div>
  ));
  const reversed = sizes.reverse().map(size => (
    <div key={`size-swatches-circle-rev-${size}`} className="size-swatches-circle" style={{ width:size, height:size }}></div>
  ));

  return (
    <div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': _.isMatch(props.selected, {styleValue1:20, styleValue2:40})
        })}
        onClick = {() => props.onSelect({styleValue1:20, styleValue2:40})}
        >
        {circles}
      </div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': _.isMatch(props.selected, {styleValue1:40, styleValue2:20})
        })}
        onClick = {() => props.onSelect({styleValue1:40, styleValue2:20})}
        >
        {reversed}
      </div>
    </div>
  );
}

SizeGradients.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.any
};