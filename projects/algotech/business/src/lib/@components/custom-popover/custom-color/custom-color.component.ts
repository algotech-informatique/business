import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'at-custom-color',
    templateUrl: './custom-color.component.html',
    styleUrls: ['./custom-color.component.scss'],
})
export class CustomColorComponent implements AfterViewInit {

    @ViewChild('popup', { static: false }) popup: ElementRef;

    color: string;
    @Output() selected = new EventEmitter();

    colorsRow1 = ['--DRAWING-ANNOTATION-COLOR-01', '--DRAWING-ANNOTATION-COLOR-02', '--DRAWING-ANNOTATION-COLOR-03'];
    colorsRow2 = ['--DRAWING-ANNOTATION-COLOR-04', '--DRAWING-ANNOTATION-COLOR-05', '--DRAWING-ANNOTATION-COLOR-06'];
    activeColor: string;

    constructor() {
    }

    ngAfterViewInit() {
        this.activeColor = this._getPropertyKey(this.color);
    }

    onSelectColor(color: string) {
        const newColor = this._getPropertyValue(color);
        this.selected.emit(newColor);
    }

    _getPropertyValue(key: string) {
        const docStyle = getComputedStyle(this.popup.nativeElement);
        const myVar = docStyle.getPropertyValue(key);
        return myVar;
    }

    _getPropertyKey(value: string) {
        let key = '--DRAWING-ANNOTATION-COLOR-01';
        const docStyle = getComputedStyle(this.popup.nativeElement);

        for (let index = 0; index < 6; index ++) {
            const keyVal = docStyle.getPropertyValue(`--DRAWING-ANNOTATION-COLOR-0${index}`);
            if (keyVal === value) {
                key = `--DRAWING-ANNOTATION-COLOR-0${index}`;
            }
        }
        return key;
    }

}
