import { SnAppDto, SnPageBoxDto, SnPageDto, SnPageEventPipeDto, SnPageWidgetDto } from '@algotech-ce/core';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class PageUtilsService {

    getWidgets(app: SnAppDto, page?: SnPageDto): SnPageWidgetDto[] {
        return (page ? [page] : app.pages).reduce((results: SnPageWidgetDto[], p) => {
            results.push(...p.widgets);
            if (p.header) {
                results.push(p.header);
            }
            if (p.footer) {
                results.push(p.footer);
            }
            for (const widget of _.compact([p.header, p.footer, ...p.widgets])) {
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

    getTree(app: SnAppDto, widget: SnPageWidgetDto, page?: SnPageDto) {
        if (!widget) {
            return [];
        }
        const widgets = this.getWidgets(app, page);
        const tree = [widget];

        let current: SnPageWidgetDto;
        do {
            current = widgets.find((w) => w.group && w.group.widgets.some((child) => child.id === tree[0].id));
            if (current) {
                tree.unshift(current);
            }
        } while (current);
        return tree;
    }

    transformAbsolute(app: SnAppDto, widget: SnPageWidgetDto, page?: SnPageDto, byClone = true) {
        if (!widget) {
            return null;
        }
        const tree = this.getTree(app, widget, page);
        const copy: SnPageWidgetDto = byClone ? _.cloneDeep(widget) : widget;
        copy.group = widget.group;
        copy.box.x = 0;
        copy.box.y = 0;
        for (const item of tree) {
            copy.box.x += item.box.x;
            copy.box.y += item.box.y;
        }
        return copy;
    }

    isMasterWidget(page: SnPageDto, widget: SnPageWidgetDto) {
        return page.widgets.includes(widget);
    }

    getDataSourcesFromWidget(snPage: SnPageDto, widget: SnPageWidgetDto): SnPageEventPipeDto[] {
        // find all ds inside widget
        const dataSourcesRegex = _.uniq(JSON.stringify(widget).match(/{{(?!\[)(datasource.*?)}}/ig));
        if (!dataSourcesRegex) {
            return [];
        }
        const dataSources = _.reduce(dataSourcesRegex, (results: SnPageEventPipeDto[], datasource: string) => {

            const split = datasource.replace('{{', '').replace('}}', '').split('.');
            const varName = split.length > 1 ? split[1] : null;
            const findDS = snPage.dataSources.find((ds) => varName && ds.key === varName);
            if (!findDS) {
                return results;
            }
            results.push(findDS);
            return results;
        }, []);

        return dataSources;
    }

    buildBox(widgets: SnPageWidgetDto[]): SnPageBoxDto {
        const x = _.min(_.map(widgets, ((w: SnPageWidgetDto) => w.box.x)));
        const y = _.min(_.map(widgets, ((w: SnPageWidgetDto) => w.box.y)));

        const width = _.max(_.map(widgets, (w: SnPageWidgetDto) => (w.box.x - x) + w.box.width));
        const height = _.max(_.map(widgets, (w: SnPageWidgetDto) => (w.box.y - y) + w.box.height));

        return {
            x,
            y,
            height,
            width
        };
    }
}
