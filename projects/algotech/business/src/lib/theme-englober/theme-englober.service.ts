import { SettingsDataService } from '@algotech/angular';
import { ThemeDto } from '@algotech/core';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ThemeEngloberService {
    public theme = new Subject<ThemeDto>();
    get keyProperties() {
        return ['BACKGROUND', 'PRIMARY', 'SECONDARY', 'TERTIARY', 'SUCCESS', 'WARNING', 'DANGER'];
    }

    get lightTheme() {
        return [{
            key: 'BACKGROUND',
            value: '#ffffff',
        }, {
            key: 'PRIMARY',
            value: '#455d7a',
        }, {
            key: 'SECONDARY',
            value: '#404553',
        }, {
            key: 'TERTIARY',
            value: '#222428',
        }, {
            key: 'SUCCESS',
            value: '#9551ae',
        }, {
            key: 'WARNING',
            value: '#e17a40',
        }, {
            key: 'DANGER',
            value: '#d33939',
        }];
    }

    get darkTheme() {
        return [{
            key: 'BACKGROUND',
            value: '#222428',
        }, {
            key: 'PRIMARY',
            value: '#a7bdd8',
        }, {
            key: 'SECONDARY',
            value: '#808b98',
        }, {
            key: 'TERTIARY',
            value: '#d9e3f0',
        }, {
            key: 'SUCCESS',
            value: '#d6a6e8',
        }, {
            key: 'WARNING',
            value: '#e17a40',
        }, {
            key: 'DANGER',
            value: '#ff7576',
        }];
    }    
    lightenDarkenColor(col, amt) {
        let a = '';
        if (col.startsWith('rgba(')) {
            const rgba2hex: { hex: string, a: string } = this.rgba2hex(col);
            col = rgba2hex?.hex;
            a = rgba2hex?.a;
        }
        if (!col || col[0] !== '#') {
            return '#000000';
        }
        let usePound = false;

        if (col[0] === "#") {
            col = col.slice(1);
            usePound = true;
        }

        if (col.length === 8) {
            a = col.slice(-2);
            col = col.slice(0, -2);
        }

        let num = parseInt(col, 16);
        let r = (num >> 16) + amt;
        if (r > 255) r = 255;
        else if (r < 0) r = 0;
        let b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255;
        else if (b < 0) b = 0;
        let g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255;
        else if (g < 0) g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16) + a;
    }

    private rgba2hex(rgba): { hex: string, a: string } {
        const rgb = rgba.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
        const alpha = (rgb && rgb[4] || "").trim();
        let hex = rgb ?
            (rgb[1] | 1 << 8).toString(16).slice(1) + (rgb[2] | 1 << 8).toString(16).slice(1) + (rgb[3] | 1 << 8).toString(16).slice(1) :
            rgba;
        let a = (alpha !== '') ? alpha : null;
        a = ((a * 255) | 1 << 8).toString(16).slice(1)
        hex = `#${hex}`;
        return { hex, a };
    }

    normalizeColor(originalColor) {
        const color = originalColor.replace(/^#/, '');
        if (color.length === 3) {
            return color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }
        return color;
    }

    decimalToHex(decimalValue) {
        return decimalValue.toString(16);
    }

    hexToDecimal(hexValue) {
        return parseInt(hexValue, 16);
    }

    mix(originalBaseColor, originalColorToAdjust, weight = 1) {
        const color = [];


        const baseColor = this.normalizeColor(originalBaseColor);
        const colorToAdjust = this.normalizeColor(originalColorToAdjust);

        const colorCharacters = colorToAdjust.length - 1;

        for (let i = 0; i <= colorCharacters; i += 2) {
            const baseColorDecimal = this.hexToDecimal(baseColor.slice(i, i + 2));
            const colorToAdjustDecimal = this.hexToDecimal(
                colorToAdjust.slice(i, i + 2)
            );

            let value = this.decimalToHex(
                Math.round(
                    colorToAdjustDecimal +
                    (baseColorDecimal - colorToAdjustDecimal) *
                    ((weight * 100) / 100)
                )
            );
            while (value.length < 2) {
                value = `0${value}`;
            }
            color.push(value);
        }
        const hexColor = color.join('');
        return `#${hexColor}`;
    }

    shade(color: string) {
        return this.mix('#000', color, 0.2);
    }

    tint(color: string) {
        return this.mix('#fff', color, 0.2);
    }

    private wc_hex_is_light(color) {
        const hex = color.trim().replace('#', '');
        const c_r = parseInt(hex.substr(0, 2), 16);
        const c_g = parseInt(hex.substr(2, 2), 16);
        const c_b = parseInt(hex.substr(4, 2), 16);
        const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
        return brightness > 155;
    }

    hover(mixColor: string, color: string) {
        if (mixColor === color) {
            return this.mix(this.wc_hex_is_light(color) ? '#000' : '#FFF', color, 0.05);
        } else {
            return this.mix(mixColor, color, 0.90);
        }
    }

    border(color: string) {
        return this.mix(this.wc_hex_is_light(color) ? '#000' : '#FFF', color, 0.2);
    }

    background(color: string) {
        // tslint:disable-next-line: max-line-length
        return `linear-gradient(
            90deg, ${this.mix(this.wc_hex_is_light(color) ? '#000' : '#FFF', color, 0)} 0%,
            ${this.mix(this.wc_hex_is_light(color) ? '#000' : '#FFF', color, 0.010)} 20%,
            ${this.mix(this.wc_hex_is_light(color) ? '#000' : '#FFF', color, 0.025)} 50%,
            ${this.mix(this.wc_hex_is_light(color) ? '#000' : '#FFF', color, 0.010)} 80%,
            ${this.mix(this.wc_hex_is_light(color) ? '#000' : '#FFF', color, 0)} 100%
        )`;
    }

}
