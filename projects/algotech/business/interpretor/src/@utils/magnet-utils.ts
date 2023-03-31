import { ApplicationModelDto, PairDto, SmartObjectDto, SnAppDto, SnPageBoxDto, SnPageWidgetDto, ZoneDto } from '@algotech-ce/core';
import { SoUtils } from './so-utils';
import * as _ from 'lodash';
import { Polygon } from './polygon';
import { WorkflowErrorMagnet } from '../error/interpretor-error';

export class MagnetUtils {

    DEFAULT_SIZE = 100;
    MARGIN_ALLOW = 15; // margin allow

    constructor(private soUtils: SoUtils) {

    }

    magnetCalculatePosition(smartObject: SmartObjectDto, smartObjects: SmartObjectDto[], prop: PairDto, apps: ApplicationModelDto[]) {
        const application = apps.find((app) => app.key === prop.value.appKey);
        if (!application) {
            throw new WorkflowErrorMagnet('ERR-145', `{{APPLICATION}} {{NOT-FOUND}} (app: ${prop.value.appKey}, zone: ${prop.value.magnetsZoneKey})`);
        }
        const board = this.findBoard(application, prop.value.magnetsZoneKey);
        if (!board) {
            throw new WorkflowErrorMagnet('ERR-146', `{{BOARD}} {{NOT-FOUND}} (app: ${prop.value.appKey}, zone: ${prop.value.magnetsZoneKey})`);
        }
        const zone = board.group.widgets.find((w) => w.custom?.key === prop.value.magnetsZoneKey);
        if (!zone) {
            throw new WorkflowErrorMagnet('ERR-147', `zone {{NOT-FOUND}} (app: ${prop.value.appKey}, zone: ${prop.value.magnetsZoneKey})`);
        }

        const box = this.getBox(smartObject, prop.value.appKey, board);

        const stepY = +(zone.custom.grid?.height > 0 ? zone.custom.grid.height : 10);
        const stepX = +(zone.custom.grid?.width > 0 ? zone.custom.grid.width : 10);

        const arrayReject = _.reject(smartObjects, (so) => so.uuid === smartObject.uuid);
        // manual
        if (prop.value.x !== -1 && prop.value.y !== -1) {
            const position = {
                x: prop.value.x,
                y: prop.value.y,
            };
            if (!zone.custom?.overlay && !this.isFreePosition(position.x, position.y, zone, arrayReject, box, prop.value.appKey, board)) {
                throw new WorkflowErrorMagnet('ERR-148', `{{NO-PLACE-AVAILABLE}}
                    (app: ${prop.value.appKey}, zone: ${prop.value.magnetsZoneKey}, x: ${prop.value.x}, y: ${prop.value.y})`);
            }
            return position;
        }

        // automatic
        for (let y = (box.height / 2); y < zone.box.height + (box.height / 2); y += stepY) {
            for (let x = (box.width / 2); x < zone.box.width + (box.width / 2); x += stepX) {
                if (this.isFreePosition(x, y, zone, arrayReject, box, prop.value.appKey, board)) {
                    return {
                        x,
                        y,
                    };
                }
            }
        }

        if (zone.custom?.overlay) {
            for (let y = zone.box.height + (box.height / 2); y >= (box.height / 2); y -= stepY) {
                for (let x = zone.box.width + (box.width / 2); x >= (box.width / 2); x -= stepX) {
                    if (this.isFreePosition(x, y, zone, [], box, prop.value.appKey, board)) {
                        return {
                            x,
                            y,
                        };
                    }
                }
            }
        }
        throw new WorkflowErrorMagnet('ERR-149', `{{NO-PLACE-AVAILABLE}} (app: ${prop.value.appKey}, zone: ${prop.value.magnetsZoneKey})`);
    }

    findBoard(application: ApplicationModelDto, zoneKey: string) {
        const widgets = this.getWidgets(application.snApp);
        return widgets.find((w) => w.typeKey === 'board' && w.group?.widgets.some((z) => z.custom?.key === zoneKey));
    }

    isFreePosition(x: number, y: number, zone: SnPageWidgetDto, smartObjects: SmartObjectDto[], box: SnPageBoxDto,
        appKey: string, board: SnPageWidgetDto) {
        if (!this.containsAllPoints(zone, box, zone.box.x + x, zone.box.y + y)) {
            return false;
        }

        return smartObjects.every((so) => {
            const soBox = this.getBox(so, appKey, board);
            return !this.overlap(Object.assign(_.cloneDeep(box), { x, y }), soBox);
        });
    }

    getZonePoints(zone: SnPageWidgetDto) {
        const points = _.cloneDeep(zone.custom?.d).replace('M', '').replace('Z', '').split('L').map((p) => p.split(','));
        return points.map(p => ({
            x: parseFloat(p[0]) + zone.box.x, y: parseFloat(p[1]) + zone.box.y
        }));
    }

    getMagnetPoints(box: SnPageBoxDto, x: number, y: number) {
        const _box = _.cloneDeep(box);
        _box.width -= this.MARGIN_ALLOW;
        _box.height -= this.MARGIN_ALLOW;

        return [
            {
                x,
                y
            },
            {
                x: x - (_box.width / 2),
                y: y - (_box.height / 2)
            },
            {
                x: x - (_box.width / 2),
                y: y - (_box.height / 2) + _box.height
            },
            {
                x: x - (_box.width / 2) + _box.width,
                y: y - (_box.height / 2) + _box.height
            },
            {
                x: x - (_box.width / 2) + _box.width,
                y: y - (_box.height / 2)
            },
        ];
    }

    containsAllPoints(zone: SnPageWidgetDto, box: SnPageBoxDto, x: number, y: number) {
        return this.containsPoint(zone, box, x, y) === 5;
    }

    containsPoint(zone: SnPageWidgetDto, box: SnPageBoxDto, x: number, y: number) {
        const polyZone = new Polygon({ x: 0, y: 0 });
        polyZone.setPoints(this.getZonePoints(zone));

        return this.getMagnetPoints(box, x, y).filter((p) => polyZone.containsPoint(p)).length;
    }

    getWidgets(app: SnAppDto): SnPageWidgetDto[] {
        return app.pages.reduce((results, p) => {
            results.push(...p.widgets);
            for (const widget of p.widgets) {
                results.push(...this.getChilds(widget));
            }
            return results;
        }, []);
    }

    getChilds(widget: SnPageWidgetDto, deep = true) {
        if (!widget.group) {
            return [];
        }

        return widget.group.widgets.reduce((childs, child) => {
            childs.push(child);
            if (deep) {
                childs.push(...this.getChilds(child, true));
            }
            return childs;
        }, []);
    }

    getBox(smartObject: SmartObjectDto, appKey: string, board: SnPageWidgetDto): SnPageBoxDto {
        const template = this.findTemplate(smartObject, board);
        const zone = this.findZoneSo(smartObject, appKey, board);

        let box = null;

        if (template) {
            box = template.box;
        }
        if (!template) {
            const templates = this.findTemplatesByModel(smartObject, board);
            if (templates.length > 0) {
                const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
                box = {
                    height: arrAvg(templates.map((t) => t.box.height)),
                    width: arrAvg(templates.map((t) => t.box.width))
                };
            } else {
                box = {
                    height: this.DEFAULT_SIZE,
                    width: this.DEFAULT_SIZE,
                };
            }
        }
        return {
            x: zone ? zone.position.x : 0,
            y: zone ? zone.position.y : 0,
            height: box.height,
            width: box.width,
        };
    }

    findTemplatesByModel(smartObject: SmartObjectDto, board: SnPageWidgetDto): SnPageWidgetDto[] {
        const templates = board.group.widgets.filter((w) => w.typeKey === 'magnet');
        return templates.filter((t) => {
            return t.custom?.modelKey === smartObject.modelKey;
        });
    }

    findTemplate(smartObject: SmartObjectDto, board: SnPageWidgetDto): SnPageWidgetDto {
        const templates = board.group.widgets.filter((w) => w.typeKey === 'magnet');
        const findTemplate = this._findTemplate(templates, smartObject);
        return findTemplate ? findTemplate : this._findTemplate(templates, smartObject, false);
    }

    _findTemplate(templates: SnPageWidgetDto[], smartObject: SmartObjectDto, withFilter = true) {
        return templates.find((t) => {

            if (t.custom?.modelKey !== smartObject.modelKey) {
                return false;
            }

            if (!t.custom?.filter) {
                return !withFilter;
            }

            return this.soUtils.respectConditions(`${smartObject.modelKey}.${t.custom.filter.property}=${t.custom.filter.value}`,
                smartObject, false);
        });
    }

    findSo(id: string, zones: any) {
        const keys = Object.keys(zones);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];

            const so = _.find(zones[key].smartObjects, { uuid: id });
            if (so) {
                return so;
            }
        }

        return null;
    }

    findAllZones(board: SnPageWidgetDto) {
        return board.group.widgets.filter((w) => w.typeKey === 'zone');
    }

    findZoneWidget(board: SnPageWidgetDto, key: string) {
        return this.findAllZones(board).find((z) => z.custom.key === key);
    }

    predicateZone(zone: ZoneDto, appKey: string, boardInstance: string, zoneKey?: string) {
        if (zone.appKey !== appKey) {
            return false;
        }
        if (boardInstance && zone.boardInstance !== boardInstance) {
            return false;
        }
        if (zoneKey && zone.magnetsZoneKey !== zoneKey) {
            return false;
        }
        return true;
    }

    findZoneSo(so: SmartObjectDto, appKey: string, board: SnPageWidgetDto, instance?: string) {
        const zonesBoard: SnPageWidgetDto[] = this.findAllZones(board);
        const zonesSo: ZoneDto[] = so.skills.atMagnet.zones.filter((z) => this.predicateZone(z, appKey, instance));

        return zonesSo.find((zoneSo) => zonesBoard.some((zoneBoard) => zoneSo.magnetsZoneKey === zoneBoard.custom.key));
    }

    findZone(so: SmartObjectDto, appKey: string, board: SnPageWidgetDto, instance?: string) {
        const zonesBoard: SnPageWidgetDto[] = this.findAllZones(board);
        const zonesSo: ZoneDto[] = so.skills.atMagnet.zones.filter((z) => this.predicateZone(z, appKey, instance));

        for (const zoneSo of zonesSo) {
            const findZone = zonesBoard.find((z) => z.custom.key === zoneSo.magnetsZoneKey);
            if (findZone) {
                return findZone;
            }
        }

        return null;
    }

    overlap(box1: SnPageBoxDto, box2: SnPageBoxDto) {
        const _box1: SnPageBoxDto = {
            x: box1.x - this.MARGIN_ALLOW / 2,
            y: box1.y - this.MARGIN_ALLOW / 2,
            height: box1.height - this.MARGIN_ALLOW,
            width: box1.width - this.MARGIN_ALLOW,
        }

        const _box2: SnPageBoxDto = {
            x: box2.x - this.MARGIN_ALLOW / 2,
            y: box2.y - this.MARGIN_ALLOW / 2,
            height: box2.height - this.MARGIN_ALLOW,
            width: box2.width - this.MARGIN_ALLOW,
        }

        const r1 = { x1: _box1.x, x2: _box1.x + _box1.width, y1: _box1.y, y2: _box1.y + _box1.height };
        const r2 = { x1: _box2.x, x2: _box2.x + _box2.width, y1: _box2.y, y2: _box2.y + _box2.height };

        return !(r1.x1 > r2.x2 ||
            r2.x1 > r1.x2 ||
            r1.y1 > r2.y2 ||
            r2.y1 > r1.y2);
    }
}
