import { forwardRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Popover } from './interfaces/popver.interface';

export abstract class PopoverSubject {
    showPopup: Subject<Popover>;
    dismissPopup: Subject<any>;
}
export function returnProvider(component: any) {
    return { provide: PopoverSubject, useExisting: forwardRef(() => component) };
}
