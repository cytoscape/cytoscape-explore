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
  const start = props.gradient.start;
  const end = props.gradient.end;
  return (
    <div 
      className={classNames({ 
        'color-gradients-color': true, 
        'color-gradients-color-selected': props.selected
      })}
      style={{ background: `linear-gradient(0.25turn, ${rgbCss(start)}, ${rgbCss(end)})` }}
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

  const gradients = props.hues.map(hue => ({
    hue,
    start: colorConvert.hsl.rgb(hue, maxS, maxL),
    end:   colorConvert.hsl.rgb(hue, minS, minL)
  }));

  return (
    <div className="color-gradients">
      { gradients.map(gradient => 
          <ColorGradient 
            gradient={gradient} 
            selected={_.isEqual(props.selected, gradient)} 
            onSelect={props.onSelect} />
      )}
    </div>
  );
}

