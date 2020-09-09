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
  
  return (
    <div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': _.isEqual(props.selected, {start:20, end:40})
        })}
        onClick = {() => props.onSelect({start:20, end:40})}
        >
        {circles}
      </div>
      <div className={classNames({ 
          'size-swatches': true, 
          'size-swatches-selected': _.isEqual(props.selected, {start:40, end:20})
        })}
        onClick = {() => props.onSelect({start:40, end:20})}
        >
        {reversed}
      </div>
    </div>
  );
}