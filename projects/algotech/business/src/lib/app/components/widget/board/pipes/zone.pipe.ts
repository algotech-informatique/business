import { SmartObjectDto, SnPageWidgetDto } from '@algotech-ce/core';
import { Pipe, PipeTransform } from '@angular/core';
import { BoardUtilsService } from '../services/board.utils.service';

@Pipe({
    name: 'zone'
})

export class ZonePipe implements PipeTransform {
    constructor (private boardUtils: BoardUtilsService) {}
    transform(smartObject: SmartObjectDto, zone: SnPageWidgetDto, appKey: string, board: SnPageWidgetDto): any {
        // todo
        return smartObject.skills.atMagnet.zones.find((z) =>
            this.boardUtils.predicateZone(z, appKey, board.custom?.instance, zone.custom?.key));
    }
}
