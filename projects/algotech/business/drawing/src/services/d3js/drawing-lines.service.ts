import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { DrawingDataDto, DrawingPenList, DrawingLineDto } from '@algotech/core';
import * as _ from 'lodash';
import { UUID } from 'angular2-uuid';
import { DrawingMathService } from '../utils/drawing-math.service';
import { DrawingUtilsService } from '../utils/drawing-utils.service';

@Injectable()
export class DrawingLinesService {

    constructor(private drawingUtilsService: DrawingUtilsService, private drawingMathService: DrawingMathService) { }

    startDrawLines(d3Context) {
        d3Context.dragged = false;
    }

    drawLines(d3Context, container, lines_layer, color: string, penType: DrawingPenList, penScale: number, data: DrawingDataDto) {
        if (!d3Context.dragged) {
            d3Context.active_line = {
                id: UUID.UUID(),
                points: [d3.mouse(container.node())],
                color,
                penType,
                penScale
            };
            data.lines.push(d3Context.active_line);
            this.redraw(lines_layer, data);
            d3Context.line = lines_layer.select(`.line-path[id*="${d3Context.active_line.id}"]`);
        } else if (!d3Context.line) {
            return;
        }
        d3Context.dragged = true;

        if (penType === 'eraser') {
            if (d3Context.active_line.points.length > 1) {
                d3Context.active_line.points.pop();
            }
            d3Context.active_line.points.push(d3.mouse(container.node()));

            // color #FF4D4D
            const eraseColor = 'var(--DRAWING-COLOR-ERASER, #FF4D4D)';
            d3Context.line.attr('stroke-width', '5px');
            d3Context.line.attr('stroke', d3.event.sourceEvent.ctrlKey ? 'transparent' : eraseColor);
            d3Context.line.style('outline', d3.event.sourceEvent.ctrlKey ? `5px dashed ${eraseColor}` : 'transparent');
        } else {
            d3Context.active_line.points.push(d3.mouse(container.node()));
        }
        d3Context.line.attr('d', this.renderLine(d3Context.active_line.points));
    }

    endDrawLines(d3Context, lines_layer, penType: DrawingPenList, data: DrawingDataDto) {
        if (!d3Context.dragged) {
            return false;
        }

        if (penType === 'eraser') {
            data.lines.pop();
            this.erase(d3Context.active_line, data);
        }

        this.redraw(lines_layer, data);
        d3Context.active_line = null;

        return true;
    }

    erase(active_line: DrawingLineDto, data: DrawingDataDto) {
        const segmentEraser = {
            n1: {
                x: active_line.points[0][0],
                y: active_line.points[0][1],
            }, n2: {
                x: active_line.points[active_line.points.length - 1][0],
                y: active_line.points[active_line.points.length - 1][1],
            }
        };
        _.remove(data.lines, (line: DrawingLineDto) => {
            if (line.points.length < 2) {
                return false;
            }

            for (let i = 0; i < line.points.length - 1; i++) {
                // intersect two paths
                const segmentLine = {
                    n1: {
                        x: line.points[i][0],
                        y: line.points[i][1],
                    }, n2: {
                        x: line.points[i + 1][0],
                        y: line.points[i + 1][1],
                    }
                };

                const intersection = this.drawingMathService.getIntersection(segmentEraser, segmentLine);
                if (!intersection) {
                    continue;
                }
                if (this.drawingMathService.isPointInsideSegment(intersection, segmentEraser) &&
                    this.drawingMathService.isPointInsideSegment(intersection, segmentLine)) {
                    return true;
                }
            }
        });
    }

    getPenSize(line: DrawingLineDto) {
        const scale = line.penScale ? line.penScale : 1;
        switch (line.penType) {
            case 'default':
                return 3 * scale;
            case 'marker': {
                return 5 * scale;
            }
            case 'highlighter': {
                return 6 * scale;
            }
            case 'brush': {
                return 20 * scale;
            }
        }
    }

    createFilter(lines_layer, line: DrawingLineDto) {
        // enlarge box
        const defs = lines_layer.select('defs');
        const id = `${line.penType}-${line.color.replace('#', '')}`;
        if (!defs) {
            return null;
        }
        if (defs.selectAll(`#${id}`).node()) {
            return id;
        }

        switch (line.penType) {
            case 'marker':
                defs.append('filter')
                    .attr('id', id)
                    .attr('filterUnits', 'userSpaceOnUse')
                    .attr('x', -10000)
                    .attr('y', -10000)
                    .attr('height', 20000)
                    .attr('width', 20000)
                    .append('feDropShadow')
                    .attr('in', 'SourceGraphic')
                    .attr('dx', '0')
                    .attr('dy', '0')
                    .attr('stdDeviation', '2')
                    .attr('flood-color', line.color);
                break;
            case 'highlighter':
                const highlighter = defs.append('filter')
                    .attr('filterUnits', 'userSpaceOnUse')
                    .attr('x', -10000)
                    .attr('y', -10000)
                    .attr('height', 20000)
                    .attr('width', 20000)
                    .attr('id', id);

                highlighter
                    .append('feDropShadow')
                    .attr('dx', '0')
                    .attr('dy', '0')
                    .attr('stdDeviation', '1')
                    .attr('flood-color', line.color);
                highlighter
                    .append('feDropShadow')
                    .attr('dx', '0')
                    .attr('dy', '0')
                    .attr('stdDeviation', '1')
                    .attr('flood-color', line.color);
                highlighter
                    .append('feDropShadow')
                    .attr('dx', '0')
                    .attr('dy', '0')
                    .attr('stdDeviation', '2')
                    .attr('flood-color', line.color);
                highlighter
                    .append('feDropShadow')
                    .attr('dx', '0')
                    .attr('dy', '0')
                    .attr('stdDeviation', '2')
                    .attr('flood-color', line.color);
                break;
        }

        return id;
    }

    redraw(lines_layer, data: DrawingDataDto) {
        const self = this;

        const rect = lines_layer.selectAll('.line').data(function () {
            return data.lines.filter((l) => l.penType !== 'eraser');
        });
        rect.enter()
            .append('rect')
            .attr('class', 'line')
            .attr('fill', 'transparent')
            .merge(rect)
            .attr('id', function (d) {
                return d.id;
            })
            .classed('selected', false)
            .style('cursor', 'default')
            .style('outline', 'inherit')
            .style('pointer-events', 'none')
            .attr('x', function (d) {
                return self.drawingUtilsService.getLineRect(d).x - (self.getPenSize(d) / 2);
            })
            .attr('y', function (d) {
                return self.drawingUtilsService.getLineRect(d).y - (self.getPenSize(d) / 2);
            })
            .attr('height', function (d) {
                return self.drawingUtilsService.getLineRect(d).height + (self.getPenSize(d));
            })
            .attr('width', function (d) {
                return self.drawingUtilsService.getLineRect(d).width + (self.getPenSize(d));
            });
        rect.exit().remove();

        const lines = lines_layer.selectAll('.line-path').data(data.lines);
        lines.enter()
            .append('path')
            .attr('class', 'line-path')
            .attr('overflow', 'visible')
            .attr('stroke-linecap', 'round')
            .attr('outline', '10px solid transparent')
            .attr('stroke-linejoin', 'round')
            .attr('fill', 'transparent')
            .style('pointer-events', 'none')
            .merge(lines)
            .attr('id', function (d) {
                return d.id;
            })
            .attr('stroke-width', function (d) {
                return `${self.getPenSize(d)}px`;
            })
            .attr('opacity', function (d) {
                if (d.penType === 'brush') {
                    return '0.3';
                } else if (d.penType === 'highlighter') {
                    return '0.7';
                }
                return '1';
            })
            .attr('stroke', function (d) {
                return d.color;
            })
            .attr('filter', function (d) {
                let id = null;
                if (d.penType === 'highlighter') {
                    id = self.createFilter(lines_layer, d);
                }
                if (d.penType === 'marker') {
                    id = self.createFilter(lines_layer, d);
                }
                return id ? `url(#${id})` : 'inherit';
            })
            .attr('d', function (d) {
                return self.renderLine(d.points);
            });

        return lines.exit().remove();
    }

    get renderLine() {
        return d3.line()
            .x(function (d) {
                return d[0];
            })
            .y(function (d) {
                return d[1];
            })
            .curve(d3.curveBasis);
    }
}
