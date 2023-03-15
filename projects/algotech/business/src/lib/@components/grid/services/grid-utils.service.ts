import { Injectable } from '@angular/core';
import { GridSelectionDto } from '../dto/grid-selection.dto';
import * as _ from 'lodash';

@Injectable()
export class GridUtilsService {
    constructor() { }
    
    isSelected(selection: GridSelectionDto, id: string): boolean {

        if (!id) {
            return false;
        }

        if (!selection.multiselection) {
            return _.isEqual(selection.selected, id);
        }

        // multi selection
        if (!Array.isArray(selection.selected)) {
            throw new Error('selection.selected have to be array');
        }

        if (id === '*') {
            return selection.list.length > 0 && selection.list.every((ele) => selection.selected.includes(ele));
        }

        return selection.selected.includes(id);
    }

    getDefaultValue(type: string) {
        switch (type) {
            case 'number':
                return 0;
            case 'boolean':
                return false;
            default:
                return '';
        }
    }
}