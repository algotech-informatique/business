import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { DrawingDataDto, DrawingLineDto } from '@algotech-ce/core';
import { DrawingMathService } from '../utils/drawing-math.service';
import { DrawingUtilsService } from '../utils/drawing-utils.service';

@Injectable()
export class DrawingSelectorService {

    selected = [];

    constructor(private drawingUtils: DrawingUtilsService, private drawingMathService: DrawingMathService) { }

    clearSelector(lines_layer) {
        lines_layer.selectAll('.selector').remove();
    }

    selectLines(lines_layer, lines: DrawingLineDto[]) {
        for (const line of lines) {
            this.selectLine(lines_layer, line);
        }
    }

    selectLine(lines_layer, line: DrawingLineDto) {
        const selected = this.selected.includes(line.id);
        lines_layer.select(`.line[id*="${line.id}"]`)
            .classed('selected', selected)
            .style('pointer-events', selected ? 'bounding-box' : 'none')
            .style('cursor', selected ? 'pointer' : 'default')
            .style('outline', selected ? '1px dashed var(--DRAWING-COLOR-SELECTION, #009AD5)' : 'inherit');
    }

    applySelect(lines_layer, line: DrawingLineDto, selected: boolean) {
        if (selected) {
            this.selected.push(line.id);
        } else {
            _.remove(this.selected, (id) => id === line.id);
        }
        this.selectLine(lines_layer, line);
    }

    unselect(lines_layer, data: DrawingDataDto) {
        this.selected = [];
        for (const line of data.lines) {
            this.applySelect(lines_layer, line, false);
        }
    }

    detectSelect(d3Context, container, lines_layer) {
        const x = Math.round(d3.mouse(container.node())[0]);
        const y = Math.round(d3.mouse(container.node())[1]);

        const selectorBox = {
            x: Math.min(x, d3Context.originX),
            y: Math.min(y, d3Context.originY),
            width: Math.abs(x - d3Context.originX),
            height: Math.abs(y - d3Context.originY)
        };

        this.selected = [];
        for (const line of d3Context.lines) {
            const selected = this.drawingMathService.overlap(selectorBox, line.rect);
            this.applySelect(lines_layer, line, selected);
        }

        return selectorBox;
    }

    startAreaSelect(d3Context, container, lines_layer, data: DrawingDataDto) {
        d3Context.originX = Math.round(d3.mouse(container.node())[0]);
        d3Context.originY = Math.round(d3.mouse(container.node())[1]);

        d3Context.dragged = false;
        d3Context.lines = data.lines.map((line) => {
            return {
                id: line.id,
                rect:  this.drawingUtils.getLineRect(line)
            };
        });

        this.detectSelect(d3Context, container, lines_layer);
    }

    areaSelect(d3Context, container, lines_layer, data) {
        if (!d3Context.dragged) {
            d3Context.selector = lines_layer.append('rect')
                .classed('selector', true)
                .attr('x', d3Context.originX)
                .attr('y', d3Context.originY)
                .attr('width', 10)
                .attr('height', 10)
                .style('opacity', '0.5')
                .style('outline', '1px solid var(--DRAWING-COLOR-SELECTION-SHADE, #2c6585)')
                .style('fill', 'var(--DRAWING-COLOR-SELECTION, #009AD5)');
        }
        d3Context.dragged = true;

        const selectorBox = this.detectSelect(d3Context, container, lines_layer);

        d3Context.selector.attr('x', selectorBox.x);
        d3Context.selector.attr('y', selectorBox.y);
        d3Context.selector.attr('height', selectorBox.height);
        d3Context.selector.attr('width', selectorBox.width);
    }

    endAreaSelect(d3Context, lines_layer) {
        this.clearSelector(lines_layer);
        return true;
    }
}
