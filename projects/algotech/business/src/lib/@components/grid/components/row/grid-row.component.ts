import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GridConfigurationDto } from '../../dto/grid-configuration.dto';
import * as _ from 'lodash';
import { GridUtilsService } from '../../services/grid-utils.service';
import { fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'at-grid-row',
    templateUrl: './grid-row.component.html',
    styleUrls: ['./grid-row.component.scss']
})

export class GridRowComponent implements OnInit {
    @Input()
    id: string;

    @Input()
    configuration: GridConfigurationDto;

    @Input()
    clickable = false;

    @Input()
    content = true;

    @Output()
    select = new EventEmitter<boolean>();

    @Output()
    actionClick = new EventEmitter();

    constructor(private gridUtilsService: GridUtilsService) { }

    ngOnInit() { }

    onCheck() {
        this.changeSelection();
    }

    onActionClick($event) {
        this.actionClick.emit($event);
    }

    changeSelection() {
        if (!this.configuration.selection || !this.id) {
            return;
        }
        if (!this.configuration.selection.multiselection) {
            this.configuration.selection.selected = this.gridUtilsService.isSelected(this.configuration.selection, this.id) ? null : this.id;
            return;
        }

        // multi selection
        if (this.id === '*') {
            this.configuration.selection.selected =
                this.gridUtilsService.isSelected(this.configuration.selection, this.id) ?
                    [] :
                    [...this.configuration.selection.list];
        } else {
            this.configuration.selection.selected =
                this.gridUtilsService.isSelected(this.configuration.selection, this.id) ?
                    _.reject(this.configuration.selection.selected, (item) => item === this.id) :
                    [...this.configuration.selection.selected, this.id];
        }

        this.select.emit(this.gridUtilsService.isSelected(this.configuration.selection, this.id));
    }
}
