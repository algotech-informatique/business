import { SmartObjectsService } from '@algotech/angular';
import { ApplicationModelDto, SmartObjectDto, SnPageDto, SnPageWidgetDto, ZoneDto } from '@algotech/core';
import { EventEmitter, Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { map, tap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { PageEventsService } from '../../../../services/page-events.service';
import { BoardUtilsService } from './board.utils.service';
import { WorkflowLaunchService } from '../../../../../workflow-launcher/workflow-layout.lancher.service';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { SysUtilsService } from '../../../../../workflow-interpretor/@utils/sys-utils.service';
import { EventData } from '../../../../models';
import { BoardServiceSelection } from './board.selection.service';

@Injectable()
export class BoardService {
    constructor(
        private boardUtils: BoardUtilsService,
        private pageEventsService: PageEventsService,
        private smartObjectService: SmartObjectsService,
        private workflowLaucher: WorkflowLaunchService,
        private soUtils: SoUtilsService,
        private sysUtils: SysUtilsService,
        private boardSelection: BoardServiceSelection,
    ) {
        // socket subscription
    }

    zones: Object = {};

    onUpdate = new Subject();

    initializeZones(board: SnPageWidgetDto, app: ApplicationModelDto) {

        return this.smartObjectService.getMagnets(app.key, board.custom.instance).pipe(
            tap((sos: SmartObjectDto[]) => {

                const zones: SnPageWidgetDto[] = this.boardUtils.findAllZones(board);
                for (const zone of zones) {
                    this.zones[`${zone.custom.key}`] = {
                        smartObjects: [],
                        points: this.boardUtils.getZonePoints(zone),
                        widget: zone,
                        box: zone.box
                    };
                }
                for (const so of sos) {
                    const zone = this.boardUtils.findZoneSo(so, app.key, board, board?.custom?.instance);
                    if (zone && this.zones[zone.magnetsZoneKey]) {
                        this.zones[zone.magnetsZoneKey].smartObjects.push(so);
                    }
                }

                this.pageEventsService.pushObjects(sos);
                this.onUpdate.next(null);
            }),
        );
    }

    change(appKey: string, board: SnPageWidgetDto) {
        return this.pageEventsService.changed.asObservable().pipe(
            map(() => {
                // subscribe end of wf, websocket, ... update smartobjects
                for (const zoneKey of Object.keys(this.zones)) {
                    for (let index = 0; index < this.zones[zoneKey].smartObjects.length; index++) {

                        // rm
                        const smartObject: SmartObjectDto = this.zones[zoneKey].smartObjects[index];
                        const find = this.pageEventsService.smartobjects.find((so) => so.uuid === smartObject.uuid);
                        if (!find || this.boardUtils.findZoneSo(find, appKey, board, board?.custom?.instance)?.magnetsZoneKey !== zoneKey) {
                            this.zones[zoneKey].smartObjects.splice(index, 1);
                            continue;
                        }

                        // chg
                        if (!_.isEqual(find, smartObject)) {
                            this.zones[zoneKey].smartObjects[index] = find;
                        }
                    }
                }

                // add
                for (const smartObject of this.pageEventsService.smartobjects) {
                    const zone = this.boardUtils.findZoneSo(smartObject, appKey, board, board?.custom?.instance);
                    if (zone && this.zones[`${zone.magnetsZoneKey}`] &&
                        !this.zones[`${zone.magnetsZoneKey}`].smartObjects.some((so) => so.uuid === smartObject.uuid)) {
                        this.zones[`${zone.magnetsZoneKey}`].smartObjects.push(smartObject);
                    }
                }
                this.onUpdate.next(null);
                return null;
            })
        );
    }

    initializeDrag(appModel: ApplicationModelDto, snPage: SnPageDto, board: SnPageWidgetDto, readonly: boolean, onMove: EventEmitter<EventData>) {
        const self = this;
        d3.select('.board').selectAll(`.magnet`)
            .on('click', function () {
                const smartObject = self.boardUtils.findSo(d3.select(this).attr('id'), self.zones);
                self.boardSelection.select(smartObject);
                d3.event.stopPropagation();
            });

        d3.select('.board')
            .on('click', function () {
                self.boardSelection.unselect();
                d3.event.stopPropagation();
            });

        d3.select('.board').selectAll(`.magnet`)
            .on('contextmenu', () => d3.event.preventDefault())
            .call(
                d3.drag()
                    .filter(function () {
                        if (d3.event.button) {
                            return false;
                        }
                        const smartObject = self.boardUtils.findSo(d3.select(this).attr('id'), self.zones);
                        const template = self.boardUtils.findTemplate(smartObject, board);
                        return self.boardUtils.authorizeToMove(template);
                    })
                    .on('start', function () {
                        self.dragstart(this, appModel, board);
                    })
                    .on('drag', function () {
                        self.drag(this, appModel, board);
                    })
                    .on('end', function () {
                        self.dragend(this, appModel, snPage, board, readonly, onMove);
                    })
            );
    }

    dragstart(d3Context, appModel: ApplicationModelDto, board: SnPageWidgetDto) {
        const soId = d3.select(d3Context).attr('id');
        d3Context.smartObject = this.boardUtils.findSo(soId, this.zones);

        const zone = this.boardUtils.findZone(d3Context.smartObject, appModel.key, board, board?.custom?.instance);

        d3Context.zoneSkills = d3Context.smartObject.skills.atMagnet.zones.find((z: ZoneDto) => 
            this.boardUtils.predicateZone(z, appModel.key, board.custom?.instance, zone.custom.key));
        d3Context.zoneEle = d3.select('.board').selectAll(`.zone[id*="${zone.custom.key}"]`);
        d3Context.zones = this.boardUtils.findAllZones(board);

        // get template
        d3Context.template = this.boardUtils.findTemplate(d3Context.smartObject, board);

        d3Context.scale = d3.select('#page-layout').style('transform');
        const regex = /scale\(([^)]*)\)/;
        d3Context.scale = regex.test(d3Context.scale) ? regex.exec(d3Context.scale)[1] : 1;

        d3Context.deltaX = Math.round(d3.mouse(d3Context.zoneEle.node())[0] / d3Context.scale) - d3Context.zoneSkills.position.x;
        d3Context.deltaY = Math.round(d3.mouse(d3Context.zoneEle.node())[1] / d3Context.scale) - d3Context.zoneSkills.position.y;

        d3Context.originx = Math.round(d3.mouse(d3Context.zoneEle.node())[0] / d3Context.scale) - d3Context.deltaX;
        d3Context.originy = Math.round(d3.mouse(d3Context.zoneEle.node())[1] / d3Context.scale) - d3Context.deltaY;

        d3Context.dragged = false;
    }

    drag(d3Context, appModel: ApplicationModelDto, board: SnPageWidgetDto) {
        if (!d3Context.dragged) {
            d3.select(d3Context).style('z-index', 10);
            d3.select(d3Context).select('.widget-magnet').classed('move', true);
            d3.select('.board').select(`.zone-content[id*="${d3Context.zoneSkills.magnetsZoneKey}"]`).style('z-index', 10);
        }

        d3Context.dragged = true;
        const currentZoneX = this.zones[d3Context.zoneSkills.magnetsZoneKey].box.x;
        const currentZoneY = this.zones[d3Context.zoneSkills.magnetsZoneKey].box.y;

        d3Context.x = Math.round(d3.mouse(d3Context.zoneEle.node())[0] / d3Context.scale) - d3Context.deltaX;
        d3Context.y = Math.round(d3.mouse(d3Context.zoneEle.node())[1] / d3Context.scale) - d3Context.deltaY;

        const nearZone = this.nearZone(d3Context, currentZoneX, currentZoneY);
        const zoneWidget = this.boardUtils.findZoneWidget(board, nearZone);
        if (zoneWidget?.custom.grid) {
            const offsetX = ((this.getRelativeX(d3Context, nearZone) -
                (d3Context.template.box.width / 2)) % zoneWidget.custom.grid.width);
            d3Context.x += (offsetX < (zoneWidget.custom.grid.width / 2)) ? (offsetX * -1) : (zoneWidget.custom.grid.width - offsetX);

            const offsetY = ((this.getRelativeY(d3Context, nearZone) -
                (d3Context.template.box.height / 2)) % zoneWidget.custom.grid.height);
            d3Context.y += (offsetY < (zoneWidget.custom.grid.height / 2)) ? (offsetY * -1) : (zoneWidget.custom.grid.height - offsetY);
        }

        d3.select(d3Context).style('left', d3Context.x - (d3Context.template.box.width / 2) + 'px');
        d3.select(d3Context).style('top', d3Context.y - (d3Context.template.box.height / 2) + 'px');

        // intersection avec la zone
        d3Context.zoneDrop = null;
        const intersectZone = this.intersectZone(d3Context, currentZoneX, currentZoneY);
        if (intersectZone && !this.intersectMagnets(d3Context, appModel, board, intersectZone)) {
            d3Context.zoneDrop = intersectZone;
        }

        d3.select(d3Context).select('.mask').style('background', d3Context.zoneDrop ? 'black' : 'var(--ALGOTECH-DANGER)');
        d3.select(d3Context).select('.authorizeToMove').style('cursor', d3Context.zoneDrop ? 'grab' : 'no-drop');

        for (const zone of this.boardUtils.findAllZones(board)) {
            zone.displayState = {
                hover: zone.custom.key === nearZone ||
                    (!nearZone && zone.custom.key === d3Context.zoneSkills.magnetsZoneKey),
            };
        }
    }

    dragend(d3Context, appModel: ApplicationModelDto, snPage: SnPageDto, board: SnPageWidgetDto, readonly: boolean, onMove: EventEmitter<EventData>) {

        d3.select('.board').select(`.zone-content[id*="${d3Context.zoneSkills.magnetsZoneKey}"]`).style('z-index', 0);
        d3.select(d3Context).select('.widget-magnet').classed('move', false);
        d3.select(d3Context).style('z-index', 0);
        d3.select(d3Context).select('.mask').style('background', 'black');
        d3.select(d3Context).select('.authorizeToMove').style('cursor', 'pointer');
        for (const zone of this.boardUtils.findAllZones(board)) {
            zone.displayState = {
                hover: false,
            };
        }

        if (!d3Context.dragged) {
            return;
        }

        if (!d3Context.zoneDrop) {
            d3.select(d3Context).style('left', d3Context.originx - (d3Context.template.box.width / 2) + 'px');
            d3.select(d3Context).style('top', d3Context.originy - (d3Context.template.box.height / 2) + 'px');

            return;
        }

        const origin = _.cloneDeep(d3Context.zoneSkills);
        const zoneOriginKey = d3Context.zoneSkills.magnetsZoneKey;

        d3Context.zoneSkills.position.x = this.getRelativeX(d3Context, d3Context.zoneDrop);
        d3Context.zoneSkills.position.y = this.getRelativeY(d3Context, d3Context.zoneDrop);

        const changeZone = zoneOriginKey !== d3Context.zoneDrop;
        if (changeZone) {
            const index = _.findIndex(this.zones[zoneOriginKey].smartObjects, (so) => {
                return so.uuid === d3Context.smartObject.uuid;
            });

            d3Context.zoneSkills.magnetsZoneKey = d3Context.zoneDrop;

            if (index !== -1) {
                const element = this.zones[zoneOriginKey].smartObjects.splice(index, 1);
                this.zones[d3Context.zoneDrop].smartObjects.push(element[0]);
            }
        }

        if (changeZone || d3Context.zoneSkills.position.x !== origin.position.x ||
            d3Context.zoneSkills.position.y !== origin.position.y) {
            this.applyMove(d3Context, origin, appModel, snPage, readonly, onMove);
        }
    }

    applyMove(d3Context, origin: ZoneDto, appModel: ApplicationModelDto, snPage: SnPageDto, readonly: boolean, onMove: EventEmitter<EventData>) {
        if (!readonly) {
            this.smartObjectService.patch(d3Context.smartObject.uuid, [{
                op: 'replace',
                path: '/skills/atMagnet',
                value: d3Context.smartObject.skills.atMagnet
            }]).subscribe();
        }

        // run workflow
        if (onMove) {
            this.workflowLaucher.setAdditional('smart-object', d3Context.smartObject);
            this.workflowLaucher.setAdditional('smart-model', this.soUtils.getModel(d3Context.smartObject.modelKey));

            this.workflowLaucher.setSourceValue('smart-object-selected', d3Context.smartObject);
            this.workflowLaucher.setSourceValue('old-magnet-zone', this.sysUtils.transform(origin, 'sys:magnet'));
            this.workflowLaucher.setSourceValue('magnet-zone', this.sysUtils.transform(d3Context.zoneSkills, 'sys:magnet'));

            const inherit = this.pageEventsService.resolveEvents(appModel, snPage, d3Context.template.events, readonly);
            onMove.emit({ key: 'onMoveMagnet', UIEvent: null, inherit });
        }

        this.onUpdate.next(null);
    }

    intersectZone(d3Context, currentZoneX: number, currentZoneY: number) {
        for (const zoneKey of Object.keys(this.zones)) {
            if (this.boardUtils.containsAllPoints(this.zones[zoneKey].widget, d3Context.template.box,
                currentZoneX + d3Context.x, currentZoneY + d3Context.y)) {
                return zoneKey;
            }
        }
    }

    nearZone(d3Context, currentZoneX: number, currentZoneY: number) {
        let res = null;
        let count = 0;
        for (const zoneKey of Object.keys(this.zones)) {
            const countOfPoints = this.boardUtils.containsPoint(this.zones[zoneKey].widget, d3Context.template.box,
                currentZoneX + d3Context.x, currentZoneY + d3Context.y);
            if (countOfPoints > count) {
                count = countOfPoints;
                res = zoneKey;
            }
        }

        return res;
    }

    intersectMagnets(d3Context, appModel: ApplicationModelDto, board: SnPageWidgetDto, zoneKey: string) {
        const zoneWidget = this.boardUtils.findZoneWidget(board, zoneKey);
        if (zoneWidget?.custom?.overlay) {
            return false;
        }

        // todo check option
        for (const so of this.zones[zoneKey].smartObjects) {
            const zone: ZoneDto = this.boardUtils.findZoneSo(so, appModel.key, board, board?.custom?.instance);
            const template = this.boardUtils.findTemplate(so, board);

            if (!zone || !template || so === d3Context.smartObject) {
                continue;
            }
            if (this.boardUtils.overlap({
                x: zone.position.x - ((template.box.width) / 2),
                y: zone.position.y - ((template.box.height) / 2),
                height: template.box.height,
                width: template.box.width,
            }, {
                x: this.getRelativeX(d3Context, zoneKey) - ((d3Context.template.box.width) / 2),
                y: this.getRelativeY(d3Context, zoneKey) - ((d3Context.template.box.height) / 2),
                height: d3Context.template.box.height,
                width: d3Context.template.box.width,
            })) {
                return true;
            }
        }
        return false;
    }

    getRelativeX(d3Context, zoneKey: string) {
        return d3Context.zoneSkills.magnetsZoneKey === zoneKey ? d3Context.x : d3Context.x +
            this.zones[d3Context.zoneSkills.magnetsZoneKey].box.x - this.zones[zoneKey].box.x;
    }

    getRelativeY(d3Context, zoneKey: string) {
        return d3Context.zoneSkills.magnetsZoneKey === zoneKey ? d3Context.y : d3Context.y +
            this.zones[d3Context.zoneSkills.magnetsZoneKey].box.y - this.zones[zoneKey].box.y;
    }
}
