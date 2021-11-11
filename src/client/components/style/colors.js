import React from 'react';
import _ from 'lodash';
import colorConvert from 'color-convert';
import classNames from 'classnames';
import Color from 'color';
import PropTypes from 'prop-types';
import { mapColor } from '../../../model/style';
import { Slider } from '@material-ui/core';


// TODO improve defaults
// TODO move default colors into style.js ??
const linearHues = {
  hues: [ 0, 30, /*60,*/ 120, 180, 240, 300 ],
  minSat: 50,
  maxSat: 50,
  minLight: 40,
  maxLight: 80,
};

// TODO, divergent gradients not properly supported yet
const colorBrewerDivergent = [
  {start:[202,0,32],   mid:[247,247,247], end:[5,113,176]}, // RdBu
  {start:[230,97,1],   mid:[247,247,247], end:[94,60,153]}, // PuOr
  // {start:[123,50,148], mid:[247,247,247], end:[0,136,55]},  // PRGn
  {start:[166,97,26],  mid:[245,245,245], end:[1,133,113]}, // BrBG
  {start:[252,141,89],  mid:[255,255,191], end:[145,191,219]}, // 3-class RdYlBu
];

function rgbCss(c) {
  return Color(c).rgb().string();
}

export const defaultColor = {r:136,g:136,b:136}; // same as the #888 from the default style in style.js


export function ColorSwatch(props) {
  return (
    <div 
      className={classNames({ 
        'color-swatches-color': true, 
        'color-swatches-color-selected': props.selected
      })}
      onClick = {() => props.onClick(props.color) }
      style={{ backgroundColor: rgbCss(props.color) }} >
    </div>
  );
}
ColorSwatch.propTypes = {
  onClick: PropTypes.func,
  selected: PropTypes.any,
  color: PropTypes.any
};
ColorSwatch.defaultProps = {
  onClick: () => null,
  selected: false,
  color: defaultColor,
};


export function ColorSwatches(props) {
  const { minSat, maxSat, minLight, maxLight } = linearHues;
  const range = 5;

  const groups = linearHues.hues.map(hue => {
    const colors = [];
    for(let i = 0; i < range; i++) {
      const p = i / (range - 1);
      const s = minSat + (maxSat - minSat) * p;
      const l = minLight + (maxLight - minLight) * p;
      const [r, g, b] = colorConvert.hsl.rgb(hue, s, l);
      colors.push({ r, g, b });
    }
    return { hue, colors };
  });

  // Monochrome
  groups.push({
    hue: 0,
    colors: [
      {r:40, g:40, b:40 },
      {r:100,g:100,b:100},
      defaultColor,
      {r:200,g:200,b:200},
      {r:230,g:230,b:230},
    ]
  });

  return (
    <div className="color-swatches">
      { groups.map((group, i) => 
        <div key={`group-${i}`} className="color-swatches-hue">
          { group.colors.map((c, i) => 
              <ColorSwatch 
                color={c}
                key={`swatch-${i}`}
                selected={_.isEqual(props.selected, c)} 
                onClick={props.onSelect} />
          )}
        </div>
      )}
    </div>
  );
}
ColorSwatches.propTypes = {
  selected: PropTypes.any,
  onSelect: PropTypes.func
};


export function ColorGradient(props) {
  if(!props.value) {
    return <div>NONE</div>;
  }

  const [ val1, val2, val3 ] = props.value;

  let colors;
  if(!val3) {
    colors = _.range(7).map(x => mapColor(x, 0, 6, val1, val2));
  } else {
    colors = [].concat(
      _.range(0,3).map(x => mapColor(x, 0, 3, val1, val2)),
      val2,
      _.range(1,4).map(x => mapColor(x, 0, 3, val2, val3))
    );
  }

  return (
      <div 
        className={classNames({ 
          'color-gradients-squares': true, 
          'color-gradients-squares-selected': props.selected
        })}
        onClick = {() => props.onSelect(props.value)}
      >
        {colors.map((c,i) =>
          <div
            key={i}
            className='color-gradients-squares-item'
            style={{ backgroundColor: rgbCss(c) }} 
          />
        )}
      </div>
  );
}
ColorGradient.propTypes = {
  value: PropTypes.array,
  onSelect: PropTypes.func,
  selected: PropTypes.any
};
ColorGradient.defaultProps = {
  onSelect: () => null,
  selected: false
};



export function ColorGradients(props) {
  const { minSat, maxSat, minLight, maxLight } = linearHues;

  const linearGradients = linearHues.hues.map(hue => {
    const s = colorConvert.hsl.rgb(hue, maxSat, maxLight);
    const e = colorConvert.hsl.rgb(hue, minSat, minLight);
    return [
      { r:s[0], g:s[1], b:s[2] },
      { r:e[0], g:e[1], b:e[2] },
    ];
  });

  const divGrads = () => 
    colorBrewerDivergent.map(val => {
      const {start:[r1,g1,b1], mid:[r2,g2,b2], end:[r3,g3,b3]} = val;
      return [
        { r:r1, g:g1, b:b1 },
        { r:r2, g:g2, b:b2 },
        { r:r3, g:g3, b:b3 },
      ];
    });

  return (
    <div>
      <div className="color-gradients">
        { !props.divergent ? null : <div>Linear</div> }
        <div>
        { linearGradients.map((value, i) => 
            <ColorGradient 
              value={value} 
              key={i}
              selected={_.isMatch(props.selected, value)}
              onSelect={props.onSelect} />
        )}
        </div>
      </div>
      { !props.divergent ? null :
        <div className="color-gradients">
          <div>Divergent</div>
          <div>
          { divGrads().map((value, i) => 
              <ColorGradient 
                value={value} 
                key={i}
                selected={_.isMatch(props.selected, value)} 
                onSelect={props.onSelect} />
          )}
          </div>
        </div>
      }
    </div>
  );
}
ColorGradients.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.any,
  divergent: PropTypes.bool,
};
ColorGradients.defaultProps = {
  onSelect: () => null,
  divergent: true,
};


export function OpacitySlider(props) {
  const debouncedOnChange = _.throttle(value => props.onSelect(value), 300, { leading: true });
  return <div className="opacity-slider"><Slider 
    min={0} 
    max={100} 
    defaultValue={Math.round((props.value || 0) * 100)}
    valueLabelDisplay='auto'
    onChange={(event,value) => debouncedOnChange(value / 100)}
  /></div>;
}
OpacitySlider.propTypes = {
  value: PropTypes.number,
  onSelect: PropTypes.func
};


export function OpacityGradient(props) {
  if(!props.value) {
    return <div>None</div>;
  }
  const reversed = props.value && props.value[0] > props.value[1];
  let colors = [{r:0, g:0, b:0}, {r:100, g:100, b:100}];
  if(reversed)
    colors = colors.reverse();

  return <ColorGradient 
    value={colors} 
    onSelect={() => props.onSelect(props.value)} 
  />;
}
OpacityGradient.propTypes = {
  onSelect: PropTypes.func,
  value: PropTypes.array,
  selected: PropTypes.bool
};
OpacityGradient.defaultProps = {
  onSelect: () => null,
  selected: false
};


export function OpacityGradients({ value, onSelect }) {
  return <div>
    <OpacityGradient onSelect={onSelect} value={[0,1]} selected={_.isEqual(value, [0,1])} />
    <OpacityGradient onSelect={onSelect} value={[1,0]} selected={_.isEqual(value, [1,0])} />
  </div>;
}
OpacityGradients.propTypes = {
  onSelect: PropTypes.func,
  value: PropTypes.array,
};
