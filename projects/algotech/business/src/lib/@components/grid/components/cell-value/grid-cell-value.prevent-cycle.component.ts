import { PairDto } from '@algotech/core';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SoUtilsService } from '../../../../workflow-interpretor/@utils/so-utils.service';
import { GridCellValueComponentBase } from './grid-cell-value.base.component';

@Component({
    selector: 'at-grid-cell-value-prevent-cycle',
    templateUrl: './grid-cell-value.component.html',
    styleUrls: ['./grid-cell-value.component.scss']
})
export class GridCellValuePreventCycleComponent extends GridCellValueComponentBase implements AfterViewInit { // for FIX NG3003
    @Input()
    editable: boolean;

    @Input()
    key: string;

    @Input()
    type: string;

    @Input()
    multiple: boolean;

    @Input()
    showNullValue = false;

    @Input()
    showMultipleValues = true;

    @Input()
    items: PairDto[];

    @Input()
    value: any;

    @Input()
    icon: string;

    @Input()
    format: any;

    @Input()
    lineBreak = false;

    @Output()
    changed = new EventEmitter<any>();

    constructor(protected soUtils: SoUtilsService, protected ref: ChangeDetectorRef) {
        super(soUtils);
    }

    ngAfterViewInit() {
        this.initialize();
        this.ref.detectChanges();
    }

    onChanged(value: any) {
        this.changed.emit(this.soUtils.formatProperty(this.type, value));
    }

    onEdit($event) {
    }
}