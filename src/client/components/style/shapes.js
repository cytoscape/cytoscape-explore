import React from 'react'; //eslint-disable-line
import PropTypes from 'prop-types';
import classNames from 'classnames';


export function NodeShapeIcon({ shape, selected, onClick }) {
  return (
    <div className={classNames({
      'node-shape-selected': selected,
      'node-shape-normal': !selected,
    })}>
      <div 
        className={`node-shape-${shape}`} 
        onClick={() => onClick(shape)} 
      />
    </div>
  );
}

NodeShapeIcon.propTypes = {
  shape: PropTypes.oneOf('ellipse', 'rectangle', 'round-rectangle', 'triangle', 'diamond'),
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};
NodeShapeIcon.defaultProps = {
  shape: 'ellipse',
  selected: false,
  onClick: () => null
};


export function NodeShapes({ selected, onSelect }) {
  return (
    <div className="node-shapes">
      <NodeShapeIcon onClick={onSelect} selected={selected === 'ellipse'} shape='ellipse' />
      <NodeShapeIcon onClick={onSelect} selected={selected === 'rectangle'} shape='rectangle' />
      <NodeShapeIcon onClick={onSelect} selected={selected === 'round-rectangle'} shape='round-rectangle' />
      <NodeShapeIcon onClick={onSelect} selected={selected === 'triangle'} shape='triangle' />
      <NodeShapeIcon onClick={onSelect} selected={selected === 'diamond'} shape='diamond' />
    </div>
  );
}

NodeShapes.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.oneOf('ellipse', 'rectangle', 'round-rectangle', 'triangle', 'diamond'),
};
NodeShapes.defaultProps = {
  onSelect: () => null,
};

export default NodeShapes;