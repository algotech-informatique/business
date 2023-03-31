import { Injectable } from '@angular/core';
import { DrawingMode } from '../interfaces';
import { DrawingDataDto, DrawingPenList } from '@algotech-ce/core';
import * as d3 from 'd3';
import { DrawingD3EventService } from './d3js/drawing-d3event.service';

@Injectable()
export class DrawingService {

    constructor(private drawingD3Event: DrawingD3EventService) {
    }

    calculate(svgID: string, containerID: string, data: DrawingDataDto, mode: DrawingMode, penType: DrawingPenList, penSale: number,
        color: string, change: () => void) {
        const svg = this.getSvg(svgID);
        const container = this.getContainer(svgID, containerID);
        if (!svg || !container) {
            return ;
        }
        this.drawingD3Event.unselect(container, data);
        this.drawingD3Event.initializeShortcut(container, data, change);
        switch (mode) {
            case 'pen':
                this.drawingD3Event.calculatePen(svg, container, color, penType, penSale, data, change);
                this.drawingD3Event.activePen(svg, color);
                return;
            case 'eraser':
                this.drawingD3Event.calculatePen(svg, container, color, 'eraser', 1, data, change);
                this.drawingD3Event.activeEraser(svg);
                return;
            case 'selector':
                this.drawingD3Event.calculateSelector(svg, container, data, change);
                this.drawingD3Event.lockEdition(svg);
                return;
            default:
                this.drawingD3Event.lockEdition(svg);
                return;
        }
    }

    draw(svgID: string, containerID: string, data: DrawingDataDto) {
        const container = this.getContainer(svgID, containerID);
        if (!container) {
            return ;
        }
        this.drawingD3Event.redraw(container, data);
    }

    finalize(svgID: string, containerID: string, data: DrawingDataDto) {
        const svg = this.getSvg(svgID);
        const container = this.getContainer(svgID, containerID);
        if (!svg || !container) {
            return;
        }
        this.drawingD3Event.finalize(svg, container, data);
    }

    private getSvg(svgID: string) {
        return d3.select(`#${svgID}`);
    }

    private getContainer(svgID: string, containerID: string) {
        const svg = d3.select(`#${svgID}`);
        if (!svg) {
            return null;
        }
        return svg.select(`#${containerID}`);
    }
}
