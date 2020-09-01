import React, { Component } from 'react';
import colorConvert from 'color-convert';

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
  return `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
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
              <div 
                className="color-swatches-color"
                onClick = {() => this.state.onSelectColor(c)}
                style={{ backgroundColor: rgbCss(c) }} >
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export class ColorGradients extends Component {
  constructor(props){
    super(props);
    this.state = Object.assign({}, defaults, props);

    const {
      minSaturation: minS,
      maxSaturation: maxS,
      minLightness: minL,
      maxLightness: maxL,
    } = this.state;

    this.state.gradients = this.state.hues.map(hue => {
      let start = colorConvert.hsl.rgb(hue, maxS, maxL);
      let end   = colorConvert.hsl.rgb(hue, minS, minL);
      return {
        hue,
        start: { rgb: start },
        end:   { rgb: end }
      };
    });
  }

  render() {
    return (
      <div className="color-gradients">
        { this.state.gradients.map(g => 
          <div 
            className="color-gradients-color"
            style={{ background: `linear-gradient(0.25turn, ${rgbCss(g.start)}, ${rgbCss(g.end)})` }}>
          </div>
        )}
      </div>
    );
  }
}

