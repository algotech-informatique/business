import { EventEmitter, Injectable } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { GridColumnConfigurationDto } from '../dto/grid-column-configuration.dto';
import { GridConfigurationDto } from '../dto/grid-configuration.dto';
import { GridScrollDto } from '../dto/grid-scroll.dto';

@Injectable()
export class GridD3Service {
    constructor() { }

    initDrag(configuration: GridConfigurationDto, scrollTo: (event: GridScrollDto) => void,
        clickColumn: (event, key: string) => void, changed: () => void) {
        if (!configuration.headerEditable) {
            return ;
        }

        this.initResize(configuration, changed);

        if (configuration?.reorder) {
            this.initReorder(configuration, scrollTo, clickColumn, changed);
        }
    }

    private initResize(configuration: GridConfigurationDto, changed: () => void) {
        const grid = d3.select(`.at-grid[id="${configuration?.id}"]`);
        let origin = {
            width: 0,
            x: 0
        };
        let width = 0;
        let id = null;
        let column: GridColumnConfigurationDto;

        grid.selectAll(`.column .right`)
            .call(
                d3.drag()
                    .on('start', (d, i, nodes) => {
                        id = d3.select(nodes[i]).attr('id');
                        column = configuration.columns.find((c) => c.key === id || c.id === id);

                        origin = {
                            width: +column.width,
                            x: d3.event.x,
                        };

                        grid.selectAll(`.column`).classed('disabled', true);
                        grid.select(`.column[id="${id}"]`).classed('drag resize', true);
                        grid.select(`.mask[id="${id}"]`).classed('drag resize', true);

                        width = column.width;
                    })
                    .on('drag', () => {
                        width = Math.max(40, +(origin.width + (d3.event.x - origin.x)));
                        grid.select(`.mask[id="${id}"]`).style('width', width + 'px');
                    })
                    .on('end', () => {
                        grid.selectAll(`.column`).classed('disabled', false);
                        grid.select(`.column[id="${id}"]`).classed('drag resize', false);
                        grid.select(`.mask[id="${id}"]`).classed('drag resize', false);

                        if (column.width !== width) {

                            column.width = width;
                            changed();
                        }
                    })
            );
    }

    initReorder(configuration: GridConfigurationDto, scrollTo: (event: GridScrollDto) => void,
        clickColumn: (event, key: string) => void, changed: () => void) {
        const grid = d3.select(`.at-grid[id="${configuration?.id}"]`);

        let originX = 0;
        let x = 0;
        let currentColumnX = 0;

        let targetColumn: GridColumnConfigurationDto = null;
        let position: {
            x: number;
            column: GridColumnConfigurationDto;
        }[] = [];

        let id = null;
        let column: GridColumnConfigurationDto;
        let drag = false;
        let ev = null;

        grid.selectAll(`.column`)
            .call(
                d3.drag()
                    .filter((d, i, nodes) => {
                        id = d3.select(nodes[i]).attr('id');
                        column = configuration.columns.find((c) => c.key === id || c.id === id);

                        return column?.sticky === 'none';
                    })
                    .on('start', () => {
                        ev = d3.event;
                        targetColumn = column;
                        originX = d3.event.x;

                        const offset = grid.node().getBoundingClientRect().left;
                        position = configuration.columns.filter((c) => c.sticky === 'none' && !c.hide).map((column) => {
                            const colId = column?.id ? column.id : column?.key;
                            return {
                                x: grid.select(`.column[id="${colId}"]`).node().getBoundingClientRect().left - offset,
                                column
                            }
                        }).reverse();
                        position.map((p) => p.x -= position[position.length - 1].x);

                        currentColumnX = position.find((c) => c.column === column)?.x;
                        drag = false;
                    })
                    .on('drag', () => {
                        if (!drag) {
                            drag = true;
                            column.selected = true;

                            grid.selectAll(`.column`).classed('disabled', true);
                            grid.select(`.column[id="${id}"]`).classed('drag move', true);
                            grid.select(`.mask[id="${id}"]`).classed('drag move', true);
                            grid.select(`.mask[id="${id}"]`).classed('target', true);
                        }

                        x = Math.min(d3.event.x - originX, position[0].x - currentColumnX);
                        let newTarget = targetColumn;

                        for (const d of position) {
                            if (currentColumnX + (column.width / 2) + x > d.x) {
                                newTarget = d.column;
                                if (targetColumn !== newTarget) {
                                    scrollTo({
                                        x: d.x,
                                        offsetRight: d.column.width + 150,
                                        delay: 300
                                    });
                                }
                                break;
                            }
                        }

                        if (targetColumn !== newTarget) {
                            targetColumn = newTarget;
                            let targetId = targetColumn?.id ? targetColumn.id : targetColumn?.key;
                            grid.selectAll(`.mask`).classed('target', false);
                            grid.selectAll(`.mask`).classed('right', false);
                            grid.selectAll(`.mask`).classed('left', false);

                            grid.select(`.mask[id="${targetId}"]`).classed(
                                configuration.columns.indexOf(targetColumn) > configuration.columns.indexOf(column) ?
                                    'right' : 'left', true);
                            grid.select(`.mask[id="${targetId}"]`).classed('target', true);
                        }

                        grid.select(`.mask[id="${id}"]>.inside`).style('left', x + 'px');
                    })
                    .on('end', () => {
                        // restore
                        column.selected = false;

                        grid.selectAll(`.mask`).classed('target', false);
                        grid.selectAll(`.mask`).classed('right', false);
                        grid.selectAll(`.mask`).classed('left', false);
                        grid.selectAll(`.column`).classed('disabled', false);
                        grid.select(`.column[id="${id}"]`).classed('drag move', false);
                        grid.select(`.mask[id="${id}"]`).classed('drag move', false);
                        grid.select(`.mask[id="${id}"]>.inside`).style('left', '0px');

                        if (targetColumn !== column) {
                            const index = configuration.columns.indexOf(targetColumn);
                            _.remove(configuration.columns, column);
                            configuration.columns.splice(index, 0, column);
                            configuration.columns = [...configuration.columns];

                            changed();
                        } else {
                            if (drag && Math.abs(x) < 10) {
                                clickColumn(ev, column.key);
                            }
                        }
                    })
            );
    }
}
