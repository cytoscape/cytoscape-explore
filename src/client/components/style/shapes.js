import React from 'react'; //eslint-disable-line
import PropTypes from 'prop-types';
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";


export function ShapeIcon({ type, shape, onClick }) {
  return (
    <div onClick={() => onClick(shape)} >
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
  onClick: PropTypes.func,
};
ShapeIcon.defaultProps = {
  shape: 'ellipse',
  type: 'node',
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
      <ToggleButtonGroup 
        exclusive={true}
        value={selected}
        onChange={(event,value) => onSelect(value)}
      >
        {shapes.map(shape =>
          <ToggleButton value={shape} key={shape}>
            <ShapeIcon type={type} shape={shape} />
          </ToggleButton>
        )}
      </ToggleButtonGroup>
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