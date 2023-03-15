import { Component, Input } from '@angular/core';
import { GridColumnConfigurationDto } from '../../dto/grid-column-configuration.dto';
import * as _ from 'lodash';

@Component({
    selector: 'at-grid-column',
    templateUrl: './grid-column.component.html',
    styleUrls: ['./grid-column.component.scss']
})

export class GridColumnComponent {
    @Input()
    width: number;

    @Input()
    hide = false;

    @Input()
    name = '';

    @Input()
    icon: string;

    @Input()
    resize = false;

    @Input()
    column: GridColumnConfigurationDto;

    @Input()
    order: 'asc' | 'desc';

    @Input()
    hasFilter = false;

    constructor() {
    }
}
