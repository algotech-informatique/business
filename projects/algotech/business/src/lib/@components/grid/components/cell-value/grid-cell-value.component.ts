import { PairDto } from '@algotech/core';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SoUtilsService } from '../../../../workflow-interpretor/@utils/so-utils.service';
import { PopoverSubject } from '../../../popover/utility';
import { GridCellValueEditMultipleComponent } from '../popup/cell-value-edit-multiple/grid-cell-value-edit-multiple.component';
import { GridCellValueComponentBase } from './grid-cell-value.base.component';
@Component({
    selector: 'at-grid-cell-value',
    templateUrl: './grid-cell-value.component.html',
    styleUrls: ['./grid-cell-value.component.scss']
})

export class GridCellValueComponent extends GridCellValueComponentBase implements AfterViewInit {
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

    constructor(private popover: PopoverSubject, protected soUtils: SoUtilsService, protected ref: ChangeDetectorRef) {
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
        if (!this.clickable) {
            return ;
        }

        if (this.multiple && this.formattedType) {

            const changed = new EventEmitter<any[]>();

            this.popover.showPopup.next({
                component: GridCellValueEditMultipleComponent,
                width: 250,
                props: {
                    key: this.key,
                    type: this.type,
                    items: this.items,
                    value: this.value,
                    changed
                }
            });

            changed.subscribe((value: any[]) => {
                if (value) {
                    this.changed.emit(value);
                }
                this.popover.dismissPopup.next(null);
            });
        }
    }
}