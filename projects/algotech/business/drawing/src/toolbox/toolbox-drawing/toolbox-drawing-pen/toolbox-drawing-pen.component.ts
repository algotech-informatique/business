import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DrawingPenList } from '@algotech/core';
@Component({
    selector: 'toolbox-drawing-pen',
    template: `
    <div class="container" #container>
        <toolbox-item [tooltip]="penDisplayName | translate" [iconClassName]="penIcon" [active]="active"
            (clicked)="onClick()" [dropdown]="'hover'" [activeColors]="activeColors">
            <div class="popup">
                <div class="pen-list">
                    <toolbox-item [tooltip]="'DRAWING-PEN' | translate" iconClassName="fa-solid fa-pen-clip" [active]="penType === 'default'"
                        (clicked)="onPenClick('default')">
                    </toolbox-item>

                    <toolbox-item [tooltip]="'DRAWING-MARKER-PEN' | translate" iconClassName="fa-solid fa-marker" [active]="penType === 'marker'"
                        (clicked)="onPenClick('marker')">
                    </toolbox-item>

                    <toolbox-item [tooltip]="'DRAWING-HIGHLIGHTER' | translate"iconClassName="fa-solid fa-highlighter"
                        [active]="penType === 'highlighter'" (clicked)="onPenClick('highlighter')">
                    </toolbox-item>

                    <toolbox-item [tooltip]="'DRAWING-BRUSH' | translate" iconClassName="fa-solid fa-paintbrush"
                        [active]="penType === 'brush'" (clicked)="onPenClick('brush')">
                    </toolbox-item>
                </div>

                <div class="color">
                    <toolbox-item *ngFor="let c of colorsRow1" iconClassName="fa-solid fa-circle"
                        [active]="c === color" [activeColors]="['--TOOLBAR-ITEM-HOVER', c]"
                        [color]="'var(' + c + ')'" (clicked)="onChangeColor(c)"></toolbox-item>
                </div>

                <div class="color">
                    <toolbox-item *ngFor="let c of colorsRow2" iconClassName="fa-solid fa-circle"
                        [active]="c === color" [activeColors]="['--TOOLBAR-ITEM-HOVER', c]"
                        [color]="'var(' + c + ')'" (clicked)="onChangeColor(c)"></toolbox-item>
                </div>

                <div class="scale">
                    <toolbox-item *ngFor="let scale of scaleArray" iconClassName="fa-solid fa-circle"
                        [active]="scale === penScale"
                        [activeColors]="['--TOOLBAR-ITEM-HOVER', '--TOOLBAR-ITEM-COLOR']"
                        [fontSize]="(6 + (scale * 5)) + 'px'"
                        (clicked)="onChangeScale(scale)"></toolbox-item>
                </div>
            </div>
        </toolbox-item>
    </div>
    `,
    styleUrls: ['./toolbox-drawing-pen.component.scss'],
})
export class ToolBoxDrawingPenComponent {
    @ViewChild('container') container: ElementRef;

    @Input()
    penType: DrawingPenList = 'default';

    @Input()
    color = '--DRAWING-COLOR-01';

    @Input()
    penScale = 1;

    @Input()
    active = false;

    @Output()
    changed = new EventEmitter();

    colorsRow1 = ['--DRAWING-COLOR-01', '--DRAWING-COLOR-02', '--DRAWING-COLOR-03'];
    colorsRow2 = ['--DRAWING-COLOR-04', '--DRAWING-COLOR-05', '--DRAWING-COLOR-06'];
    scaleArray = [1, 2, 3, 4];

    activeColors = ['--TOOLBAR-ITEM-ACTIVE', '--TOOLBAR-ITEM-ACTIVE-COLOR'];
    penIcon = 'fa-solid fa-pen-clip';
    penDisplayName = 'DRAWING-PEN';

    constructor() { }

    onClick() {
        this.changed.emit();
    }

    onPenClick(penType: DrawingPenList) {
        this.penType = penType;
        this.refresh();
        this.changed.emit();
    }

    refresh() {
        switch (this.penType) {
            case 'default':
                this.penIcon = 'fa-solid fa-pen-clip';
                this.penDisplayName = 'DRAWING-PEN';
                break;
            case 'marker':
                this.penIcon = 'fa-solid fa-marker';
                this.penDisplayName = 'DRAWING-MARKER-PEN';
                break;
            case 'highlighter':
                this.penIcon = 'fa-solid fa-highlighter';
                this.penDisplayName = 'DRAWING-HIGHLIGHTER';
                break;
            case 'brush':
                this.penIcon = 'fa-solid fa-paintbrush';
                this.penDisplayName = 'DRAWING-BRUSH';
                break;
        }
    }

    onChangeColor(color: string) {
        this.color = color;
        const hexColor = this.hexColor;
        this.activeColors = ['--TOOLBAR-ITEM-ACTIVE', this.color];
        this.changed.emit();
    }

    onChangeScale(scale) {
        this.penScale = scale;
        this.changed.emit();
    }

    get hexColor() {
        return this.getHexColor(this.color);
    }

    private wc_hex_is_light(color) {
        const hex = color.trim().replace('#', '');
        const c_r = parseInt(hex.substr(0, 2), 16);
        const c_g = parseInt(hex.substr(2, 2), 16);
        const c_b = parseInt(hex.substr(4, 2), 16);
        const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
        return brightness > 155;
    }

    private getHexColor(varName: string) {
        return getComputedStyle(this.container.nativeElement).getPropertyValue(varName).trim();
    }
}
