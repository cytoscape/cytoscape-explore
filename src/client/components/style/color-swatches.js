import React, { Component } from 'react';
import _ from 'lodash';
import colorConvert from 'color-convert';
import classNames from 'classnames';

// TODO improve defaults
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
  range: 5,
  onSelectColor: () => {}
};

// TODO, divergent gradients not properly supported yet
const colorBrewerDivergent = [
  {start:[202,0,32],   mid:[247,247,247], end:[5,113,176]}, // RdBu
  {start:[230,97,1],   mid:[247,247,247], end:[94,60,153]}, // PuOr
  {start:[123,50,148], mid:[247,247,247], end:[0,136,55]},  // PRGn
  {start:[166,97,26],  mid:[245,245,245], end:[1,133,113]}, // BrBG
  {start:[215,25,28],  mid:[255,255,191], end:[26,150,65]}, // RdLyGn
]

function rgbCss(color) {
  let [r, g, b] = color.rgb || color;
  return `rgb(${r}, ${g}, ${b})`;
}


export function ColorSwatch(props) {
    return (
      <div 
        className={classNames({ 
          'color-swatches-color': true, 
          'color-swatches-color-selected': props.selected
        })}
        onClick = {() => props.onSelect(props.color)}
        style={{ backgroundColor: rgbCss(props.color) }} >
      </div>
    );
}


export class ColorSwatches extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, defaults, props);

    this.state.groups = this.state.hues.map(hue => {
      const colors = [];

      const {
        minSaturation: minS,
        maxSaturation: maxS,
        minLightness: minL,
        maxLightness: maxL,
        range
      } = this.state;

      for(let i = 0; i < range; i++) {
        const p = i / (range - 1);
        const s = minS + (maxS - minS) * p;
        const l = minL + (maxL - minL) * p;

        const [r, g, b] = colorConvert.hsl.rgb(hue, s, l);

        colors.push({
          hsl: [hue, s, l],
          rgb: [r, g, b]
        });
      }

      return {
        hue,
        colors
      };
    });
  }

  render() {
    const { groups } = this.state;

    return (
      <div className="color-swatches">
        { groups.map(group => 
          <div className="color-swatches-hue">
            { group.colors.map(c => 
                <ColorSwatch 
                  color={c} 
                  selected={this.props.selected === c} 
                  onSelect={this.props.onSelect} />
            )}
          </div>
        )}
      </div>
    );
  }
}


export function ColorGradient(props) {
  const { start, mid, end } = props.gradient;
  const bg = (mid)
    ? `linear-gradient(0.25turn, ${rgbCss(start)}, ${rgbCss(mid)}, ${rgbCss(end)})`
    : `linear-gradient(0.25turn, ${rgbCss(start)}, ${rgbCss(end)})` ;
  
  return (
    <div 
      className={classNames({ 
        'color-gradients-color': true, 
        'color-gradients-color-selected': props.selected
      })}
      style={{ background: bg }}
      onClick = {() => props.onSelect(props.gradient)} >
    </div>
  );
}


export function ColorGradients(props) {
  props = Object.assign({}, defaults, props);

  const {
    minSaturation: minS,
    maxSaturation: maxS,
    minLightness: minL,
    maxLightness: maxL,
  } = props;

  const linearGradients = props.hues.map(hue => ({
    start: colorConvert.hsl.rgb(hue, maxS, maxL),
    end:   colorConvert.hsl.rgb(hue, minS, minL)
  }));

  const divergetGradients = colorBrewerDivergent;

  return (
    <div className="color-gradients">
      <div>Linear</div>
      <div>
      { linearGradients.map(gradient => 
          <ColorGradient 
            gradient={gradient} 
            selected={_.isEqual(props.selected, gradient)} 
            onSelect={props.onSelect} />
      )}
      </div>
      <div>Divergent</div>
      <div>
      { divergetGradients.map(gradient => 
          <ColorGradient 
            gradient={gradient} 
            selected={_.isEqual(props.selected, gradient)} 
            onSelect={props.onSelect} />
      )}
      </div>
    </div>
  );
}

