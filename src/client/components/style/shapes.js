import React from 'react'; //eslint-disable-line
import PropTypes from 'prop-types';
import classNames from 'classnames';


export function ShapeIcon({ type, shape, selected, onClick }) {
  return (
    <div className={classNames({
      'shape-selected': selected,
      'shape-normal': !selected,
      })}
      onClick={() => onClick(shape)} >
      <div 
        style={{cursor:'pointer'}}
        className={`${type}-${shape}`} 
      />
    </div>
  );
}

ShapeIcon.propTypes = {
  shape: PropTypes.oneOf([
    'ellipse', 'rectangle', 'round-rectangle', 'triangle', 'diamond', 
    'solid', 'dotted', 'dashed',
    'none', 'triangle', 'circle', 'square', 'diamond', 'vee',
  ]),
  type: PropTypes.oneOf('node', 'line', 'arrow'),
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};
ShapeIcon.defaultProps = {
  shape: 'ellipse',
  type: 'node',
  selected: false,
  onClick: () => null
};


export function ShapeIconGroup({ type, selected, onSelect }) {
  let shapes;
  if(type === 'node')
    shapes = ['ellipse', 'rectangle', 'round-rectangle', 'triangle', 'diamond'];
  else if(type === 'line')
    shapes = ['solid', 'dotted', 'dashed'];
  else if(type === 'arrow')
    shapes = ['none', 'triangle', 'circle', 'vee', 'square', 'diamond'];

  return (
    <div className="shape-icons">
      {shapes.map(shape => 
        <ShapeIcon 
          type={type} 
          shape={shape} 
          onClick={onSelect} 
          selected={selected === shape} 
          key={shape} 
        />
      )}
    </div>
  );
}

ShapeIconGroup.propTypes = {
  type: ShapeIcon.propTypes.type,
  selected: ShapeIcon.propTypes.shape,
  onSelect: PropTypes.func,
};
ShapeIconGroup.defaultProps = {
  onSelect: () => null,
};


export default ShapeIcon;