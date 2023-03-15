import { SnAppDto, SnPageDto } from '@algotech/core';
import { ElementRef, Injectable } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

interface Transform {
    x: number;
    y: number;
    k: number;
}

@Injectable()
export class PageZoomService {

    transform: Transform;
    zoomed = new Subject();

    constructor() {
    }

    public initialize(app: SnAppDto, page: SnPageDto, zoomScale: number, zoomMin: number, zoomMax: number) {
        // zoom
        this.zoom(this.centerPoint(page, zoomScale), page, zoomMin, zoomMax);
    }

    zoom(transform: Transform, page: SnPageDto, zoomMin: number, zoomMax: number) {

        if (transform) {
            this.transform = transform;
        }
        /*
            zoom initialize
        */
        const zoom = this.buildZoom(page, zoomMin, zoomMax);
        d3.select(`.page-content[id*="${page.id}"]`).call(zoom.transform,
            d3.zoomIdentity.translate(this.transform.x, this.transform.y).scale(this.transform.k));
        d3.select(`.page-content[id*="${page.id}"]>#page-layout`).attr('transform', `translate(${this.transform.x}, ${this.transform.y})scale(${this.transform.k})`);
        /**/
    }

    private buildZoom(page: SnPageDto, zoomMin: number, zoomMax: number) {
        const self = this;
        const zoom = d3
            .zoom()
            .scaleExtent([zoomMin, zoomMax])
            .wheelDelta(function () {
                return -d3.event.deltaY * (navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 0.05 : 0.002);
            })
            .filter(function () {
                return true;
            })
            .on('zoom', () => {
                self.transform = d3.event.transform;
                this.zoomed.next(d3.event.transform);
                d3.select(`.page-content[id*="${page.id}"]>#page-layout`).style('transform', () => {
                    const t = d3.event.transform;
                    return `translate(${t.x}px, ${t.y}px) scale(${t.k})`;
                }).style('transform-origin', '0 0');
            });

        d3.select(`.page-content[id*="${page.id}"]`)
            .call(zoom)
            .on('dblclick.zoom', null);

        return zoom;
    }

    private centerPoint(page: SnPageDto, zoomScale: number) {

        const scale = zoomScale ? zoomScale : Math.min(1,
            Math.min((window.innerWidth / page.pageWidth), (window.innerHeight / page.pageHeight)));

        return {
            k: scale,
            x: ((window.innerWidth / 2) - (page.pageWidth * scale / 2)),
            y: ((window.innerHeight / 2) - (page.pageHeight * scale / 2))
        };
    }
}
