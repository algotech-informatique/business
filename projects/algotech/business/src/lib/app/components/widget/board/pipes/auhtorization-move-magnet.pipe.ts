import { SmartObjectDto, SnPageWidgetDto } from '@algotech/core';
import { Pipe, PipeTransform } from '@angular/core';
import { BoardUtilsService } from '../services/board.utils.service';

@Pipe({
    name: 'authorizationMoveMagnet'
})

export class AuthorizationMoveMagnetPipe implements PipeTransform {
    constructor(private boardUtilsService: BoardUtilsService) {}
    transform(template: SnPageWidgetDto): any {
        return this.boardUtilsService.authorizeToMove(template);
    }
}
