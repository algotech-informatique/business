import { SmartObjectDto, SnPageWidgetDto } from '@algotech-ce/core';
import { Pipe, PipeTransform } from '@angular/core';
import { BoardUtilsService } from '../services/board.utils.service';

@Pipe({
    name: 'magnet'
})

export class MagnetPipe implements PipeTransform {

    constructor(private boardUtils: BoardUtilsService) {}

    transform(smartObject: SmartObjectDto, board: SnPageWidgetDto): any {
        return this.boardUtils.findTemplate(smartObject, board);
    }
}
