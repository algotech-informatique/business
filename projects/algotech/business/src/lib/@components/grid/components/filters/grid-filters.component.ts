import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as _ from 'lodash';
import { SearchSOFilterDto, SysQueryDto } from '@algotech/core';
import { GridConfigurationDto } from '../../dto/grid-configuration.dto';
import { GridStorageDto } from '../../dto/grid-storage.dto';
import { DataService } from '@algotech/angular';

@Component({
    selector: 'at-grid-filters',
    templateUrl: './grid-filters.component.html',
    styleUrls: ['./grid-filters.component.scss']
})

export class GridFiltersComponent {
    @Input()
    currentQuery: SysQueryDto;

    @Input()
    configuration: GridConfigurationDto;

    @Output()
    queryChanged = new EventEmitter<SysQueryDto>();

    @Input()
    save = false;

    constructor(private dataService: DataService) {
    }

    removeFilter(filter: SearchSOFilterDto) {
        this.currentQuery.filter = _.reject(this.currentQuery.filter, filter);
        
        if (this.save && this.dataService.active) {

            const storage: GridStorageDto = {
                columns: this.configuration.columns,
                filter: this.currentQuery?.filter,
                order: this.currentQuery?.order,
            }
            this.dataService.save(storage, 'grid', this.configuration.id).subscribe();
        }

        this.queryChanged.emit(this.currentQuery);
    }
}
