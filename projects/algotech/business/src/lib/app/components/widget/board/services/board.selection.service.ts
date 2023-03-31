import { SmartObjectDto } from '@algotech-ce/core';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class BoardServiceSelection {
    onSelect = new Subject();
    selections: SmartObjectDto[] = [];

    constructor() { }
    
    select(smartObject: SmartObjectDto) {
        this.selections = [smartObject];
        this.onSelect.next(smartObject);
    }

    unselect() {
        this.selections = [];
        this.onSelect.next(null);
    }
}