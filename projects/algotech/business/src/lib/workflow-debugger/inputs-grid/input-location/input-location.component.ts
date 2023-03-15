import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { InputLocation } from '../dto/input-location.dto';
import { InputsGridService } from '../inputs-grid.service';


@Component({
    selector: 'input-grid-location',
    styleUrls: ['./input-location.component.scss'],
    templateUrl: './input-location.component.html'
})
export class InputLocationComponent implements OnChanges {

    @Input() inputLoc;
    @Output() changed = new EventEmitter();

    locations: InputLocation[] = [];

    constructor(
        private gridService: InputsGridService,
    ) {
    }

    ngOnChanges() {
        if (this.inputLoc.value) {
            this.locations = [this.inputLoc.value];
        } else {
            this.locations = [
                {
                    coordinates: [0, 0],
                    layerKey: '',
                    type: 'plan'
                }
            ];
        }
    }

    updateLatLng(dataLocation: InputLocation) {
        this.onChanged(dataLocation);
    }

    onClickMore(dataLocation: InputLocation) {
        this.gridService.searchObject(null, this.inputLoc.type, this.inputLoc.multiple,
            _.isArray(this.inputLoc.value) ? this.inputLoc.value : null).subscribe((value) => {
            if (value) {
                this.updateValue(value, dataLocation);
            }
        });
    }

    updateValue(value, dataLocation: InputLocation) {
        dataLocation.layerKey = value.layerKey;
        this.onChanged(dataLocation);
    }

    onChanged(dataLocation: InputLocation) {
        const data = { 'input': this.inputLoc, 'data': dataLocation };
        this.changed.emit(data);
    }
}
