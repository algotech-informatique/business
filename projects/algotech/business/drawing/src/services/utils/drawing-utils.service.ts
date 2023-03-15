import { DrawingLineDto } from '@algotech/core';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class DrawingUtilsService {
    getLineRect(line: DrawingLineDto) {
        const allX = line.points.map((p) => p[0]);
        const allY = line.points.map((p) => p[1]);
        return {
            x: _.min(allX),
            y: _.min(allY),
            width: _.max(allX) - _.min(allX),
            height: _.max(allY) - _.min(allY),
        };
    }
}
