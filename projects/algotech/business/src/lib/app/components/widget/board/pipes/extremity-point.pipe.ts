import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'extremityPoint'
})

export class ExtremityPointPipe implements PipeTransform {
    transform(points: { x: number, y: number }[]): any {
        return _.orderBy(points, 'x').reduce((res, p) => {
            if (p.y > res.y - 50) {
                return p;
            }
            return res;
        }, { x: 0, y: 0 });
    }
}
