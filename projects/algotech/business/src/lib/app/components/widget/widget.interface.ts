import { SnPageWidgetDto, ApplicationModelDto, SnPageDto, PairDto } from '@algotech-ce/core';
import { EventEmitter } from '@angular/core';
import { EventData, PageData } from '../../models';

export interface Widget {
    appModel: ApplicationModelDto;
    snPage?: SnPageDto;
    widget: SnPageWidgetDto;
    origin?: SnPageWidgetDto;
    readonly?: boolean;
    item?: PageData;
    custom?: any;
    parent?: SnPageWidgetDto;
    types?: Object;

    onChanged?: () => void;

    event: EventEmitter<EventData>;
    data?: EventEmitter<PairDto>;
}
