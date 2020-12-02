import React from 'react'; //eslint-disable-line
import PropTypes from 'prop-types';
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import { IconButton, Tooltip } from '@material-ui/core';
import { DiamondIcon, EllipseIcon, HexagonIcon, OctagonIcon, RectangleIcon, RoundRectangleIcon, RhomboidIcon, TriangleIcon, VeeIcon } from '../svg-icons';

const iconProps = {
  viewBox: '0 0 32 32',
  style: { width: 'auto', fontSize: 18, margin: 0 },
  p: 0,
  m: 0,
};

const allShapes = {
  node: [
    { name: 'ellipse', label: 'Ellipse', icon: <EllipseIcon {...iconProps} /> },
    { name: 'rectangle', label: 'Rectangle', icon: <RectangleIcon {...iconProps} /> },
    { name: 'round-rectangle', label: 'Round Rectangle', icon: <RoundRectangleIcon {...iconProps} /> },
    { name: 'triangle', label: 'Triangle', icon: <TriangleIcon {...iconProps} /> },
    { name: 'diamond', label: 'Diamond', icon: <DiamondIcon {...iconProps} /> },
    { name: 'hexagon', label: 'Hexagon', icon: <HexagonIcon {...iconProps} /> },
    { name: 'octagon', label: 'Octagon', icon: <OctagonIcon {...iconProps} /> },
    { name: 'rhomboid', label: 'Parallelogram', icon: <RhomboidIcon {...iconProps} /> },
    { name: 'vee', label: 'V', icon: <VeeIcon {...iconProps} /> },
  ],
  line: [
    { name: 'solid', label: 'Solid', icon: <EllipseIcon {...iconProps} /> },
    { name: 'dotted', label: 'Dotted', icon: <EllipseIcon {...iconProps} /> },
    { name: 'dashed', label: 'Dashed', icon: <EllipseIcon {...iconProps} /> },
  ],
  arrow: [
    { name: 'none', label: 'None', icon: <EllipseIcon {...iconProps} /> },
    { name: 'triangle', label: 'Triangle', icon: <EllipseIcon {...iconProps} /> },
    { name: 'circle', label: 'Circle', icon: <EllipseIcon {...iconProps} /> },
    { name: 'square', label: 'Square', icon: <EllipseIcon {...iconProps} /> },
    { name: 'diamond', label: 'Diamond', icon: <EllipseIcon {...iconProps} /> },
    { name: 'vee', label: 'V', icon: <EllipseIcon {...iconProps} /> },
  ]
};

export function ShapeIcon({ type, name, onClick }) {
  const shapes = allShapes[type];
  const shape = shapes.filter(obj => {
    return obj.name === name;
  })[0];

  return (
    <Tooltip title={shape.label}>
      <IconButton size="small" color="inherit" onClick={() => onClick(name)}>
        {shape.icon}
      </IconButton>
    </Tooltip>
  );
}

ShapeIcon.propTypes = {
  name: PropTypes.oneOf([
    'ellipse', 'rectangle', 'round-rectangle', 'rhomboid', 'triangle', 'diamond', 'hexagon', 'octagon', 'vee',
    'solid', 'dotted', 'dashed',
    'none', 'triangle', 'circle', 'square', 'diamond', 'vee',
  ]),
  type: PropTypes.oneOf('node', 'line', 'arrow'),
  onClick: PropTypes.func,
};
ShapeIcon.defaultProps = {
  name: 'ellipse',
  type: 'node',
  onClick: () => null
};


export function ShapeIconGroup({ type, selected, onSelect }) {
  const shapes = allShapes[type];

  return (
    <div className="shape-icons">
      <ToggleButtonGroup 
        exclusive={true}
        value={selected}
        onChange={(e, v) => onSelect(v)}
      >
        {shapes.map(shape =>
          <Tooltip title={shape.label} key={`tooltip-${shape.name}`}>
            <ToggleButton value={shape.name} key={shape.name} selected={shape.name === selected}>
              {shape.icon}
            </ToggleButton>
          </Tooltip>
        )}
      </ToggleButtonGroup>
    </div>
  );
}

ShapeIconGroup.propTypes = {
  type: ShapeIcon.propTypes.type,
  selected: ShapeIcon.propTypes.name,
  onSelect: PropTypes.func,
};
ShapeIconGroup.defaultProps = {
  onSelect: () => null,
};


export default ShapeIcon;