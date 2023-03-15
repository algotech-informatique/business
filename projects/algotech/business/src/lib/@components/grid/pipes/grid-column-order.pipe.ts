import { PairDto } from '@algotech/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'gridColumnOrder'
})

export class GridColumnOrderPipe implements PipeTransform {

    transform(listOrder: PairDto[], columnKey: string): string {
        return listOrder?.find(o => o.key === columnKey)?.value;
    }

}