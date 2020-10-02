import React, { Component } from 'react';
import _ from 'lodash';
import classNames from 'classnames';


export function SizeSlider(props) {
  const debouncedChange = _.debounce(value => props.onSelect(value), 150)
  return (
    <input 
      type="range" 
      min="1" 
      max="100" 
      onChange={event => debouncedChange(event.target.value)} // have to get the value here synchronously
      defaultValue={props.size || 50} />
  );
}


export function SizeGradients(props) {
  // TODO this code is pretty hackey
  const sizes = [20, 25, 30, 35, 40];
  const circles = sizes.map(size => (
    <div className="size-swatches-circle" style={{ width:size, height:size }}></div>
  ));
  const reversed = circles.slice().reverse();
  
  // MKTODO is there a better way to do this?
  const isSelected = value =>
      value && 
      props.selected &&
      _.isEqual(props.selected.styleValue1, value.styleValue1) &&
      _.isEqual(props.selected.styleValue2, value.styleValue2);

  return (
    <div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': isSelected({styleValue1:20, styleValue2:40})
        })}
        onClick = {() => props.onSelect({styleValue1:20, styleValue2:40})}
        >
        {circles}
      </div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': isSelected({styleValue1:40, styleValue2:20})
        })}
        onClick = {() => props.onSelect({styleValue1:40, styleValue2:20})}
        >
        {reversed}
      </div>
    </div>
  );
}