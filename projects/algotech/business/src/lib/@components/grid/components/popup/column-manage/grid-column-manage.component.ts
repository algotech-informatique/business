import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { GridColumnConfigurationDto } from '../../../dto/grid-column-configuration.dto';
import { GridConfigurationDto } from '../../../dto/grid-configuration.dto';

@Component({
    selector: 'at-grid-column-manage',
    templateUrl: './grid-column-manage.component.html',
    styleUrls: ['./grid-column-manage.component.scss']
})

export class GridColumnManageComponent implements AfterViewInit {
    configuration: GridConfigurationDto;
    configurationChanged = new EventEmitter();
    searchValue = '';
    allSelected = false;
    display: string[] = []

    constructor(private ref: ChangeDetectorRef) {
    }

    showColumn(column: GridColumnConfigurationDto) {
        column.hide = !column.hide;
        this.refreshAllSelected()
        this.configurationChanged.emit();
    }

    ngAfterViewInit() {
        this.refreshAllSelected();
        this.filterElements();
        this.ref.detectChanges();
    }

    filterElements() {
        this.display = this.configuration.columns
            .filter((column) => {
                if (!this.searchValue) {
                    return true;
                }
                return column.key?.toUpperCase()?.includes(this.searchValue.toUpperCase()) ||
                    column?.name?.toUpperCase().includes(this.searchValue.toUpperCase());
            })
            .map(column => column.key);
    }

    refreshAllSelected() {
        this.allSelected = this.configuration.columns.every((column) => !column.hide);
    }

    selectAll(value: boolean) {
        this.allSelected = value;
        this.configuration.columns.forEach((column) => column.hide = !value);
        this.configurationChanged.emit();
    }
}
