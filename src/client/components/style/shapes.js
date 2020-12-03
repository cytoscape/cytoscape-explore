import React from 'react'; //eslint-disable-line
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import { IconButton, Tooltip } from '@material-ui/core';
import { DiamondIcon, EllipseIcon, HexagonIcon, OctagonIcon, RectangleIcon, RoundRectangleIcon, RhomboidIcon, TriangleIcon, VeeIcon } from '../svg-icons';
import { CircleArrowIcon, DiamondArrowIcon, NoneArrowIcon, SquareArrowIcon, TeeArrowIcon, TriangleArrowIcon, TriangleCrossArrowIcon } from '../svg-icons';
import { DashedLineIcon, DottedLineIcon, SolidLineIcon } from '../svg-icons';


const nodeIconProps = {
  viewBox: '0 0 32 32',
  style: { width: 'auto', fontSize: 24, margin: 0 },
  p: 0,
  m: 0,
};

/*
 * NOTE: a) Not all Cy.js shapes are exposed here, but only the ones that are also supported by Cytoscape 3.
 *       b) The labels are the ones used by Cytoscape 3, in order to keep this app consistent with the Cytoscape ecosystem.
 */
const allShapes = {
  node: [
    { name: 'ellipse', label: 'Ellipse', icon: <EllipseIcon {...nodeIconProps} /> },
    { name: 'rectangle', label: 'Rectangle', icon: <RectangleIcon {...nodeIconProps} /> },
    { name: 'round-rectangle', label: 'Round Rectangle', icon: <RoundRectangleIcon {...nodeIconProps} /> },
    { name: 'triangle', label: 'Triangle', icon: <TriangleIcon {...nodeIconProps} /> },
    { name: 'diamond', label: 'Diamond', icon: <DiamondIcon {...nodeIconProps} /> },
    { name: 'hexagon', label: 'Hexagon', icon: <HexagonIcon {...nodeIconProps} /> },
    { name: 'octagon', label: 'Octagon', icon: <OctagonIcon {...nodeIconProps} /> },
    { name: 'rhomboid', label: 'Parallelogram', icon: <RhomboidIcon {...nodeIconProps} /> },
    { name: 'vee', label: 'V', icon: <VeeIcon {...nodeIconProps} /> },
  ],
  line: [
    { name: 'solid', label: 'Solid', icon: <SolidLineIcon {...nodeIconProps} /> },
    { name: 'dotted', label: 'Dots', icon: <DottedLineIcon {...nodeIconProps} /> },
    { name: 'dashed', label: 'Dash', icon: <DashedLineIcon {...nodeIconProps} /> },
  ],
  arrow: [
    { name: 'none', label: 'None', icon: <NoneArrowIcon {...nodeIconProps} /> },
    { name: 'triangle', label: 'Delta', icon: <TriangleArrowIcon {...nodeIconProps} /> },
    { name: 'circle', label: 'Circle', icon: <CircleArrowIcon {...nodeIconProps} /> },
    { name: 'square', label: 'Square', icon: <SquareArrowIcon {...nodeIconProps} /> },
    { name: 'diamond', label: 'Diamond', icon: <DiamondArrowIcon {...nodeIconProps} /> },
    { name: 'tee', label: 'T', icon: <TeeArrowIcon {...nodeIconProps} /> },
    { name: 'triangle-cross', label: 'Cross Delta', icon: <TriangleCrossArrowIcon {...nodeIconProps} /> },
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
    'none', 'triangle', 'circle', 'square', 'diamond', 'tee', 'triangle-cross',
  ]),
  type: PropTypes.oneOf('node', 'line', 'arrow'),
  onClick: PropTypes.func,
};
ShapeIcon.defaultProps = {
  name: 'ellipse',
  type: 'node',
  onClick: () => null
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

  return (
    <div className="shape-icons">
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