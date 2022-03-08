import React from 'react'; //eslint-disable-line
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import { IconButton, Tooltip } from '@material-ui/core';

import { DiamondIcon, EllipseIcon, HexagonIcon, OctagonIcon, RectangleIcon, RoundRectangleIcon, RhomboidIcon, TriangleIcon, VeeIcon } from '../svg-icons';
import { CircleArrowIcon, DiamondArrowIcon, NoneArrowIcon, SquareArrowIcon, TeeArrowIcon, TriangleArrowIcon, TriangleCrossArrowIcon } from '../svg-icons';
import { DashedLineIcon, DottedLineIcon, SolidLineIcon } from '../svg-icons';

const iconProps = {
  style: { fontSize: 24, margin: 0 },
  p: 0,
  m: 0,
};

/*
 * NOTE: a) Not all Cy.js shapes are exposed here, but only the ones that are also supported by Cytoscape 3.
 *       b) The labels are the ones used by Cytoscape 3, in order to keep this app consistent with the Cytoscape ecosystem.
 */
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
    { name: 'solid', label: 'Solid', icon: <SolidLineIcon {...iconProps} /> },
    { name: 'dotted', label: 'Dots', icon: <DottedLineIcon {...iconProps} /> },
    { name: 'dashed', label: 'Dash', icon: <DashedLineIcon {...iconProps} /> },
  ],
  arrow: [
    { name: 'none', label: 'None', icon: <NoneArrowIcon {...iconProps} /> },
    { name: 'triangle', label: 'Delta', icon: <TriangleArrowIcon {...iconProps} /> },
    { name: 'circle', label: 'Circle', icon: <CircleArrowIcon {...iconProps} /> },
    { name: 'square', label: 'Square', icon: <SquareArrowIcon {...iconProps} /> },
    { name: 'diamond', label: 'Diamond', icon: <DiamondArrowIcon {...iconProps} /> },
    { name: 'tee', label: 'T', icon: <TeeArrowIcon {...iconProps} /> },
    { name: 'triangle-cross', label: 'Cross Delta', icon: <TriangleCrossArrowIcon {...iconProps} /> },
  ]
};

export function ShapeIcon({ type, shape, onClick }) {
  const shapes = allShapes[type];
  const shapeObj = shapes.filter(obj => obj.name === shape)[0];
  return (
    <div>
      <IconButton 
        size="small" 
        color="primary" 
        onClick={() => onClick(shapeObj.name)}>
        {shapeObj ? shapeObj.icon : "none"}
      </IconButton>
    </div>
  );
}

ShapeIcon.propTypes = {
  type: PropTypes.oneOf(['node', 'line', 'arrow']),
  shape: PropTypes.oneOf([
    'ellipse', 'rectangle', 'round-rectangle', 'rhomboid', 'triangle', 'diamond', 'hexagon', 'octagon', 'vee',
    'solid', 'dotted', 'dashed',
    'none', 'triangle', 'circle', 'square', 'diamond', 'tee', 'triangle-cross',
  ]),
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};
ShapeIcon.defaultProps = {
  type: 'node',
  shape: 'ellipse',
  onClick: () => null,
  selected: false
};

const StyledToggleButtonGroup = withStyles((theme) => ({
  grouped: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    border: 'none',
    '&:not(:first-child)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-child': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}))(ToggleButtonGroup);

export function ShapeIconGroup({ type, selected, onSelect }) {
  const shapes = allShapes[type];
  console.log("selected shape: " + selected);

  return (
    <StyledToggleButtonGroup
      size="small"
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
    </StyledToggleButtonGroup>
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