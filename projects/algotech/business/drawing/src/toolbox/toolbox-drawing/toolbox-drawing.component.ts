import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { DrawingMode } from '../../interfaces';
import { DrawingDataDto, DrawingPenList } from '@algotech-ce/core';
import { DrawingService } from '../../services';
import { ToolBoxDrawingPenComponent } from './toolbox-drawing-pen/toolbox-drawing-pen.component';

@Component({
    selector: 'toolbox-drawing',
    template: `
        <div class="toolbox">
            <toolbox-item [tooltip]="'DRAWING-FINISH' | translate" iconClassName="fa-solid fa-xmark" color="var(--TOOLBAR-DISABLE-COLOR)"
                (clicked)="enable()" *ngIf="active">
            </toolbox-item>
            <toolbox-item [tooltip]="'DRAWING-DRAW' | translate" iconClassName="fa-solid fa-pencil-alt" (clicked)="enable()" *ngIf="!active">
            </toolbox-item>

            <div class="option" [ngStyle]="{'display': active ? 'flex' : 'none'}">
                <toolbox-drawing-pen #drawingPen [active]="mode === 'pen'"
                    (changed)="onClick('pen')"></toolbox-drawing-pen>
                <toolbox-item [tooltip]="'DRAWING-CLEAR' | translate" iconClassName="fa-solid fa-eraser" [active]="mode === 'eraser'"
                    (clicked)="onClick('eraser')"></toolbox-item>
                <toolbox-item [tooltip]="'DRAWING-SELECT' | translate" iconClassName="fa-solid fa-arrow-pointer" [active]="mode === 'selector'"
                    (clicked)="onClick('selector')"></toolbox-item>
            </div>
        </div>
    `,
    styleUrls: ['./toolbox-drawing.component.scss'],
})
export class ToolBoxDrawingComponent implements OnChanges, OnDestroy {
    @ViewChild('drawingPen', { static: false }) drawingPen: ToolBoxDrawingPenComponent;
    @Input() active = false;
    @Input() mode: DrawingMode = 'pen';
    @Input() svgID: string;
    @Input() containerID: string;
    @Input() data: DrawingDataDto = { lines: [], elements: [] };

    @Output()
    dataChanged = new EventEmitter();

    @Output()
    activated = new EventEmitter();

    constructor(public drawingService: DrawingService) {
    }

    ngOnChanges() {
        this.drawingService.draw(this.svgID, this.containerID, this.data);
    }

    ngOnDestroy() {
        this.drawingService.finalize(this.svgID, this.containerID, this.data);
    }

    onClick(mode: DrawingMode) {
        this.mode = mode;
        this.drawingService.calculate(this.svgID, this.containerID, this.data, this.mode, this.drawingPen.penType, this.drawingPen.penScale,
            this.drawingPen.hexColor, () => { this.dataChanged.emit(this.data);
        });
    }

    enable() {
        this.active = !this.active;
        if (!this.active) {
            this.drawingService.finalize(this.svgID, this.containerID, this.data);
            this.activated.emit(this.active);
            return ;
        }
        this.drawingService.calculate(this.svgID, this.containerID, this.data, this.mode, this.drawingPen.penType, this.drawingPen.penScale,
            this.drawingPen.hexColor, () => { this.dataChanged.emit(this.data);
        });

        this.activated.emit(this.active);
    }
}
