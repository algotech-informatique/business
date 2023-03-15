import { DrawingDataDto, DrawingPenList } from '@algotech/core';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { DrawingLinesService } from './drawing-lines.service';
import { DrawingSelectorService } from './drawing-selector.service';
import { DrawingDragService } from './drawing-drag.service';
import * as _ from 'lodash';

@Injectable()
export class DrawingD3EventService {

    constructor(
        private drawingLineService: DrawingLinesService,
        private drawingDragService: DrawingDragService,
        private drawingSelector: DrawingSelectorService) { }

    activePen(svg, color: string) {
        // define pointer
        this.getEditionLayer(svg)
            .style('pointer-events', 'auto')
            // tslint:disable-next-line: max-line-length
            .style('cursor', `url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath opacity='0.4' d='M9 0.28125C4.18359 0.28125 0.28125 4.18359 0.28125 9C0.28125 13.8164 4.18359 17.7188 9 17.7188C13.8164 17.7188 17.7188 13.8164 17.7188 9C17.7188 4.18359 13.8164 0.28125 9 0.28125ZM9 15.1875C5.58773 15.1875 2.8125 12.4102 2.8125 9C2.8125 5.58984 5.58773 2.8125 9 2.8125C12.4123 2.8125 15.1875 5.58984 15.1875 9C15.1875 12.4102 12.4123 15.1875 9 15.1875Z' fill='black'/%3E%3Cpath d='M9 15.1875C5.58773 15.1875 2.8125 12.4102 2.8125 9C2.8125 5.58984 5.58773 2.8125 9 2.8125C12.4123 2.8125 15.1875 5.58984 15.1875 9C15.1875 12.4102 12.4123 15.1875 9 15.1875Z' opacity='${0.6}' fill='${color.replace('#', '%23')}' /%3E%3C/svg%3E%0A") 9 9, pointer`);
    }

    activeEraser(svg) {
        // define pointer
        this.getEditionLayer(svg)
            .style('pointer-events', 'auto')
            // tslint:disable-next-line: max-line-length
            .style('cursor', `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0)'%3E%3Cpath opacity='0.4' d='M19.9999 18.0312V18.9687C19.9999 19.0433 19.9703 19.1149 19.9176 19.1676C19.8648 19.2204 19.7933 19.25 19.7187 19.25H11.3749C11.0766 19.25 10.7904 19.1314 10.5795 18.9205L8.32948 16.6705C8.11852 16.4595 8 16.1734 8 15.875C8 15.5766 8.11852 15.2905 8.32948 15.0795L11.517 11.892L16.8579 17.233L16.3409 17.75H19.7187C19.7933 17.75 19.8648 17.7796 19.9176 17.8324C19.9703 17.8851 19.9999 17.9567 19.9999 18.0312Z' fill='black'/%3E%3Cpath d='M16.8578 17.2329L19.6703 14.4204C19.8812 14.2095 19.9998 13.9233 19.9998 13.625C19.9998 13.3266 19.8812 13.0405 19.6703 12.8295L15.9203 9.07951C15.7093 8.86855 15.4232 8.75003 15.1248 8.75003C14.8265 8.75003 14.5403 8.86855 14.3293 9.07951L11.5168 11.892L12.5774 12.9526L16.8578 17.2329Z' fill='black'/%3E%3C/g%3E%3Cpath opacity='0.4' d='M4 0.625C2.13609 0.625 0.625 2.13609 0.625 4C0.625 5.86391 2.13609 7.375 4 7.375C5.86391 7.375 7.375 5.86391 7.375 4C7.375 2.13609 5.86391 0.625 4 0.625ZM5.67938 5.67938C5.29084 6.06791 4.77961 6.3097 4.23279 6.36356C3.68596 6.41741 3.13738 6.28 2.68052 5.97473C2.22365 5.66946 1.88677 5.21522 1.72727 4.68941C1.56776 4.1636 1.59551 3.59876 1.80579 3.09111C2.01606 2.58347 2.39585 2.16444 2.88044 1.90543C3.36503 1.64641 3.92444 1.56343 4.46335 1.67063C5.00226 1.77783 5.48733 2.06857 5.8359 2.49331C6.18448 2.91806 6.375 3.45053 6.375 4C6.37586 4.31202 6.31481 4.6211 6.19541 4.90937C6.07601 5.19763 5.90061 5.45935 5.67938 5.67938V5.67938Z' fill='black'/%3E%3Cpath d='M4 3.5C3.90111 3.5 3.80444 3.52932 3.72221 3.58427C3.63999 3.63921 3.5759 3.7173 3.53806 3.80866C3.50022 3.90002 3.49031 4.00055 3.50961 4.09755C3.5289 4.19454 3.57652 4.28363 3.64645 4.35355C3.71637 4.42348 3.80546 4.4711 3.90245 4.49039C3.99945 4.50969 4.09998 4.49978 4.19134 4.46194C4.2827 4.4241 4.36079 4.36001 4.41573 4.27779C4.47068 4.19556 4.5 4.09889 4.5 4C4.5 3.86739 4.44732 3.74021 4.35355 3.64645C4.25979 3.55268 4.13261 3.5 4 3.5V3.5ZM4.25 5.5H3.75C3.6837 5.5 3.62011 5.52634 3.57322 5.57322C3.52634 5.62011 3.5 5.6837 3.5 5.75V7.75C3.5 7.8163 3.52634 7.87989 3.57322 7.92678C3.62011 7.97366 3.6837 8 3.75 8H4.25C4.3163 8 4.37989 7.97366 4.42678 7.92678C4.47366 7.87989 4.5 7.8163 4.5 7.75V5.75C4.5 5.6837 4.47366 5.62011 4.42678 5.57322C4.37989 5.52634 4.3163 5.5 4.25 5.5ZM2.25 3.5H0.25C0.183696 3.5 0.120107 3.52634 0.0732233 3.57322C0.0263392 3.62011 0 3.6837 0 3.75L0 4.25C0 4.3163 0.0263392 4.37989 0.0732233 4.42678C0.120107 4.47366 0.183696 4.5 0.25 4.5H2.25C2.3163 4.5 2.37989 4.47366 2.42678 4.42678C2.47366 4.37989 2.5 4.3163 2.5 4.25V3.75C2.5 3.6837 2.47366 3.62011 2.42678 3.57322C2.37989 3.52634 2.3163 3.5 2.25 3.5ZM7.75 3.5H5.75C5.6837 3.5 5.62011 3.52634 5.57322 3.57322C5.52634 3.62011 5.5 3.6837 5.5 3.75V4.25C5.5 4.3163 5.52634 4.37989 5.57322 4.42678C5.62011 4.47366 5.6837 4.5 5.75 4.5H7.75C7.8163 4.5 7.87989 4.47366 7.92678 4.42678C7.97366 4.37989 8 4.3163 8 4.25V3.75C8 3.6837 7.97366 3.62011 7.92678 3.57322C7.87989 3.52634 7.8163 3.5 7.75 3.5ZM4.25 0H3.75C3.6837 0 3.62011 0.0263392 3.57322 0.0732233C3.52634 0.120107 3.5 0.183696 3.5 0.25V2.25C3.5 2.3163 3.52634 2.37989 3.57322 2.42678C3.62011 2.47366 3.6837 2.5 3.75 2.5H4.25C4.3163 2.5 4.37989 2.47366 4.42678 2.42678C4.47366 2.37989 4.5 2.3163 4.5 2.25V0.25C4.5 0.183696 4.47366 0.120107 4.42678 0.0732233C4.37989 0.0263392 4.3163 0 4.25 0V0Z' fill='black'/%3E%3Cdefs%3E%3CclipPath id='clip0'%3E%3Crect width='12' height='12' fill='white' transform='translate(8 8)'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A") 0 0, pointer`);
    }

    lockEdition(svg) {
        this.getEditionLayer(svg)
            .style('pointer-events', 'none')
            .style('cursor', 'default');
    }

    getEditionLayer(svg) {
        const select = svg.select('.cursor_layer');
        if (select.node()) {
            return select;
        } else {
            return svg
                .append('foreignObject')
                .attr('width', '100%')
                .attr('height', '100%')
                .classed('cursor_layer', true);
        }
    }

    getLineLayer(container) {
        let layer = container.select('.lines_layer');
        if (layer.node()) {
            return layer;
        } else {
            layer = container
                .append('g')
                .classed('lines_layer', true);

            layer.append('defs');
            return layer;
        }
    }

    calculatePen(svg, container, color: string, penType: DrawingPenList, penScale: number, data: DrawingDataDto, change: () => void) {
        const self = this;
        this.getEditionLayer(svg).call(
            d3.drag()
                .on('start', function () {
                    self.drawingLineService.startDrawLines(this);
                })
                .on('drag', function () {
                    self.drawingLineService.drawLines(this, container, self.getLineLayer(container), color, penType, penScale, data);
                })
                .on('end', function () {
                    if (self.drawingLineService.endDrawLines(this, self.getLineLayer(container), penType, data)) {
                        change();
                    }
                })
        );
        self.drawingLineService.redraw(self.getLineLayer(container), data);
    }

    calculateSelector(svg, container, data: DrawingDataDto, change: () => void) {
        const self = this;
        svg.call(
            d3.drag()
                .on('start', function () {
                    self.drawingSelector.startAreaSelect(this, container, self.getLineLayer(container), data);
                })
                .on('drag', function () {
                    self.drawingSelector.areaSelect(this, container, self.getLineLayer(container), data);
                })
                .on('end', function () {
                    if (self.drawingSelector.endAreaSelect(this, self.getLineLayer(container))) {
                        self.dragLines(container, data, change);
                    }
                })
        );
    }

    dragLines(container, data: DrawingDataDto, change: () => void) {
        const lines = this.getLineLayer(container).selectAll('.line.selected');
        const self = this;
        lines.call(
            d3.drag()
                .on('start', function () {
                    self.drawingDragService.startDragLines(this, data);
                })
                .on('drag', function () {
                    self.drawingDragService.dragLines(this, data.lines.filter((l) => self.drawingSelector.selected.includes(l.id)));
                    self.redraw(container, data);
                    self.drawingSelector.selectLines(self.getLineLayer(container), data.lines);
                })
                .on('end', function () {
                    if (self.drawingDragService.endDragLines(this)) {
                        change();
                    }
                })
        );
    }

    initializeShortcut(container, data: DrawingDataDto, change: () => void) {
        const self = this;
        // Manage Key Pressed
        d3.select('body')
            .on('keydown', function () {
                if (document.activeElement && ((document.activeElement as HTMLElement).isContentEditable)) {
                    return;
                }
                if (document.activeElement?.tagName !== 'BODY') {
                    return;
                }

                // REMOVE
                if (d3.event.keyCode === 46 || (process.platform === 'darwin' && d3.event.keyCode === 8) &&
                    self.drawingSelector.selected.length > 0) {

                    _.remove(data.lines, (l) => self.drawingSelector.selected.includes(l.id));
                    self.drawingSelector.unselect(self.getLineLayer(container), data);
                    self.redraw(container, data);
                    change();
                }
            });
    }

    unselect(container, data: DrawingDataDto) {
        this.drawingSelector.unselect(this.getLineLayer(container), data);
    }

    redraw(container, data: DrawingDataDto) {
        this.drawingLineService.redraw(this.getLineLayer(container), data);
    }

    finalize(svg, container, data: DrawingDataDto) {
        d3.select('body').on('keydown', null);

        svg.on('click', null);
        svg.call(
            d3.drag()
                .on('start', null)
                .on('drag', null)
                .on('end', null)
        );
        this.getEditionLayer(svg).call(
            d3.drag()
                .on('start', null)
                .on('drag', null)
                .on('end', null)
        );
        this.getLineLayer(container).selectAll('.line.selected').call(
            d3.drag()
                .on('start', null)
                .on('drag', null)
                .on('end', null)
        );


        this.unselect(container, data);
        this.lockEdition(svg);
    }
}
