import { PairDto } from '@algotech/core';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { GridConfigurationDto } from '../../../dto/grid-configuration.dto';
import { GridComponent } from '../../../grid.component';
import { GridUtilsService } from '../../../services/grid-utils.service';

@Component({
    selector: 'at-grid-cell-value-edit-multiple',
    templateUrl: './grid-cell-value-edit-multiple.component.html',
    styleUrls: ['./grid-cell-value-edit-multiple.component.scss']
})

export class GridCellValueEditMultipleComponent implements AfterViewInit {
    @ViewChild(GridComponent) grid: GridComponent;

    key: string;
    items: PairDto[];
    value: any[];
    type: string;

    configuration: GridConfigurationDto;
    array: { value: any }[] = [];

    changed = new EventEmitter<any>();

    constructor(private ref: ChangeDetectorRef, private gridUtils: GridUtilsService) {}

    ngAfterViewInit() {
        this.array = Array.isArray(this.value) ? this.value.map((value) => ({ value })) : [];
        this.configuration = {
            id: '-',
            search: false,
            rowHeight: 40,
            colSelectable: false,
            headerEditable: false,
            reorder: false,
            columns: [],
            hasActions: false,
        };

        this.ref.detectChanges();
    }

    onAddNewRow() {
        this.array.push({ value: this.gridUtils.getDefaultValue(this.type) });
        this.ref.detectChanges();
        setTimeout(() => {
            this.grid.focus(`${this.array.length - 1}`, 'item', 'bottom');
        }, 0);
    }

    onRemove(index: number) {
        this.array.splice(index, 1);
    }

    onChanged(value: any, index: number) {
        this.array[index].value = value;
    }

    onSave() {
        this.changed.emit(this.array.map((item) => item.value));
    }

    onCancel() {
        this.changed.emit(null);
    }
}
