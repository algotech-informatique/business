import { Pipe, PipeTransform } from '@angular/core';
import { GridSelectionDto } from '../dto/grid-selection.dto';
import { GridUtilsService } from '../services/grid-utils.service';

@Pipe({
    name: 'gridIsSelected'
})

export class GridIsSelectedPipe implements PipeTransform {
    constructor(private gridUtilsService: GridUtilsService) {}
    transform(selected: string|string[], id: string, selection: GridSelectionDto): boolean {
        return this.gridUtilsService.isSelected(selection, id);
    }
}