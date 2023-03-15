import { DrawingDataDto, DrawingLineDto } from '@algotech/core';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { DrawingUtilsService } from '../utils/drawing-utils.service';

@Injectable()
export class DrawingDragService {

    constructor(private drawingUtils: DrawingUtilsService) {}

    startDragLines(d3Context, data: DrawingDataDto) {
        const current = d3.select(d3Context);
        d3Context.line = data.lines.find((l) => l.id === current.attr('id'));
        const canvas = this.drawingUtils.getLineRect(d3Context.line);

        d3Context.deltaX = canvas.x - d3.event.x;
        d3Context.deltaY = canvas.y - d3.event.y;

        d3Context.dragged = false;
    }

    dragLines(d3Context, lines: DrawingLineDto[]) {
        d3Context.dragged = true;
        const canvas = this.drawingUtils.getLineRect(d3Context.line);

        const offsetX = (d3.event.x + d3Context.deltaX) - canvas.x;
        const offsetY = (d3.event.y + d3Context.deltaY) - canvas.y;

        for (const line of lines) {
            for (const point of line.points) {
                point[0] += offsetX;
                point[1] += offsetY;
            }
        }
    }

    endDragLines(d3Context) {
        if (!d3Context.dragged) {
            return false;
        }
        return true;
    }
}
