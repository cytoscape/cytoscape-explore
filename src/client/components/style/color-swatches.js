import React, { Component } from 'react';
import _ from 'lodash';
import colorConvert from 'color-convert';
import classNames from 'classnames';
import Color from 'color';
import PropTypes from 'prop-types';
import { StrikethroughS } from '@material-ui/icons';


// TODO improve defaults
// TODO move default colors into style.js ??
const defaults = {
  hues: [
    0,
    30,
    60,
    120,
    180,
    240,
    300,
  ],
  minSaturation: 50,
  maxSaturation: 50,
  minLightness: 40,
  maxLightness: 80,
  range: 5
};

// TODO, divergent gradients not properly supported yet
// const colorBrewerDivergent = [
//   {start:[202,0,32],   mid:[247,247,247], end:[5,113,176]}, // RdBu
//   {start:[230,97,1],   mid:[247,247,247], end:[94,60,153]}, // PuOr
//   {start:[123,50,148], mid:[247,247,247], end:[0,136,55]},  // PRGn
//   {start:[166,97,26],  mid:[245,245,245], end:[1,133,113]}, // BrBG
//   {start:[215,25,28],  mid:[255,255,191], end:[26,150,65]}, // RdLyGn
// ];

function rgbCss(c) {
  return Color(c).rgb().string();
}


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


export class ColorSwatches extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, defaults, props);

    this.state.groups = this.state.hues.map(hue => {
      const {
        minSaturation: minS,
        maxSaturation: maxS,
        minLightness: minL,
        maxLightness: maxL,
        range
      } = this.state;

      const colors = [];
      for(let i = 0; i < range; i++) {
        const p = i / (range - 1);
        const s = minS + (maxS - minS) * p;
        const l = minL + (maxL - minL) * p;
        const [r, g, b] = colorConvert.hsl.rgb(hue, s, l);
        colors.push({ r, g, b });
      }

      return {
        hue,
        colors
      };
    });

    // Monochrome
    this.state.groups.push({
      hue: 0,
      colors: [
        {r:40, g:40, b:40 },
        {r:100,g:100,b:100},
        {r:150,g:150,b:150},
        {r:200,g:200,b:200},
        {r:230,g:230,b:230},
      ]
    });
  }

  render() {
    const { groups } = this.state;

    return (
      <div className="color-swatches">
        { groups.map((group, i) => 
          <div key={`group-${i}`} className="color-swatches-hue">
            { group.colors.map((c, i) => 
                <ColorSwatch 
                  color={c}
                  key={`swatch-${i}`}
                  selected={_.isEqual(this.props.selected, c)} 
                  onClick={this.props.onSelect} />
            )}
          </div>
        )}
      </div>
    );
  }
}

ColorSwatches.propTypes = {
  selected: PropTypes.any,
  onSelect: PropTypes.func
};


export function ColorGradient(props) {
  const { styleValue1, styleValue2, styleValue3 } = props.value;
  const bg = (styleValue3)
    ? `linear-gradient(0.25turn, ${rgbCss(styleValue1)}, ${rgbCss(styleValue2)}, ${rgbCss(styleValue3)})`
    : `linear-gradient(0.25turn, ${rgbCss(styleValue1)}, ${rgbCss(styleValue2)})` ;
  
  return (
    <div 
      className={classNames({ 
        'color-gradients-color': true, 
        'color-gradients-color-selected': props.selected
      })}
      style={{ background: bg }}
      onClick = {() => props.onSelect(props.value)} >
    </div>
  );
}

ColorGradient.propTypes = {
  value: PropTypes.instanceOf({
    styleValue1: PropTypes.any,
    styleValue2: PropTypes.any,
    styleValue3: PropTypes.any
  }),
  onSelect: PropTypes.func,
  selected: PropTypes.any
};


export function ColorGradients(props) {
  props = Object.assign({}, defaults, props);

  const {
    minSaturation: minS,
    maxSaturation: maxS,
    minLightness: minL,
    maxLightness: maxL,
  } = props;

  const linearGradients = props.hues.map(hue => {
    const s = colorConvert.hsl.rgb(hue, maxS, maxL);
    const e = colorConvert.hsl.rgb(hue, minS, minL);
    return {
      styleValue1: { r: s[0], g: s[1], b: s[2] },
      styleValue2: { r: e[0], g: e[1], b: e[2] },
    };
  });

  return (
    <div className="color-gradients">
      {/* <div>Linear</div> */}
      <div>
      { linearGradients.map((value, i) => 
          <ColorGradient 
            value={value} 
            key={`gradient-${i}`}
            selected={_.isMatch(props.selected, value)}
            onSelect={props.onSelect} />
      )}
      </div>
      {/* <div>Divergent</div>
      <div>
      { colorBrewerDivergent.map(value => 
          <ColorGradient 
            gradient={value} 
            selected={_.isMatch(props.selected, value)} 
            onSelect={props.onSelect} />
      )}
      </div> */}
    </div>
  );
}

ColorGradients.propTypes = {
  minSaturation: PropTypes.number,
  maxSaturation: PropTypes.number,
  minLightness: PropTypes.number,
  maxLightness: PropTypes.number,
  onSelect: PropTypes.func,
  hues: PropTypes.arrayOf(PropTypes.number),
  selected: PropTypes.any
};