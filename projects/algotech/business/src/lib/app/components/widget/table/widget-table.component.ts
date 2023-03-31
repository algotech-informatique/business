import { AfterViewInit, Component, EventEmitter } from '@angular/core';
import { GridColumnConfigurationDto } from '../../../../@components/grid/dto/grid-column-configuration.dto';
import { GridConfigurationDto } from '../../../../@components/grid/dto/grid-configuration.dto';
import { WidgetItterable } from '../itterable/widget-itterable';
import { Widget } from '../widget.interface';
import * as _ from 'lodash';
import { SettingsDataService, TranslateLangDtoService } from '@algotech-ce/angular';
import { SoUtilsService } from '../../../../workflow-interpretor/@utils/so-utils.service';
import { PageCustomService } from '../../../services/page-custom.service';
import { PageEventsService } from '../../../services/page-events.service';
import { PageUtilsService } from '../../../services/page-utils.service';
import { WorkflowLaunchService } from '../../../../workflow-launcher/workflow-layout.lancher.service';
import { GenericListDto, GenericListValueDto, PairDto, SmartObjectDto, SysQueryDto } from '@algotech-ce/core';
import { GridSelectionDto } from '../../../../@components/grid/dto/grid-selection.dto';
import { EventData } from '../../../models';

@Component({
    selector: 'widget-table',
    templateUrl: './widget-table.component.html',
    styleUrls: ['./widget-table.component.scss']
})

export class WidgetTableComponent extends WidgetItterable implements Widget, AfterViewInit {

    configuration: GridConfigurationDto;
    columns: GridColumnConfigurationDto[];
    rowClickable = false;
    event: EventEmitter<EventData>;
    data?: EventEmitter<PairDto>;

    constructor(
        protected pageEventsService: PageEventsService,
        protected pageCustomService: PageCustomService,
        protected pageUtils: PageUtilsService,
        protected soUtils: SoUtilsService,
        protected settingsDataService: SettingsDataService,
        protected translateLangDto: TranslateLangDtoService,
        private workflowLaucher: WorkflowLaunchService) {
        super(pageEventsService, pageCustomService, pageUtils);
    }

    ngAfterViewInit() {
        const ev = this.widget.events.find((e) => e.eventKey.toLowerCase() === 'onrowclick');
        this.rowClickable = ev?.pipe?.length > 0;
    }

    initialize() {
        super.initialize();
        this.setConfiguration();
    }

    onQueryChanged(query: SysQueryDto) {
        if (this.configuration.selection) {
            this.configuration.selection.selected = [];
        }
        if (query.skip > 0) {
            this.loading = true;
            this.moreDataToLoad = false;
            this.createList(true).subscribe();
        } else {
            this.search$.next(null);
        }
    }

    onSelect(value: boolean, id?: string) {
        const last = this.configuration.selection.selected.length > 0 ?
            this.configuration.selection.selected[this.configuration.selection.selected.length - 1] : null;

        this.data.emit({
            key: 'smart-object-selected',
            value: !value ? last : (id ? id : last),
        });
        this.data.emit({
            key: 'smart-objects-selected',
            value: Array.isArray(this.selection.selected) ? this.selection.selected : null,
        });
    }

    onActionClick($event, id?: string) {
        if (!Array.isArray(this.widget.custom.collection)) {
            return;
        }

        if (id) {
            const smartObject: SmartObjectDto = this.widget.custom.collection.find((so) => so.uuid === id);

            this.workflowLaucher.setAdditional('smart-object', smartObject);
            this.workflowLaucher.setAdditional('smart-model', this.soUtils.getModel(smartObject.modelKey));
            this.workflowLaucher.setSourceValue('smart-object-selected', smartObject.uuid);
            this.workflowLaucher.setSourceValue('smart-objects-selected', [smartObject.uuid]);
        } else {

            const smartObjects: SmartObjectDto[] = this.widget.custom.collection.filter((so) => this.selection.selected.includes(so.uuid));
            if (smartObjects.length > 0) {
                this.workflowLaucher.setAdditional('smart-object', smartObjects.length > 0 ? smartObjects[0] : null);
                this.workflowLaucher.setAdditional('smart-model', this.soUtils.getModel(smartObjects[0].modelKey));
                this.workflowLaucher.setSourceValue('smart-object-selected', smartObjects.length === 1 ? smartObjects[0].uuid : null);
                this.workflowLaucher.setSourceValue('smart-objects-selected', smartObjects.map((so) => so.uuid));
            }
        }

        this.event.emit({ key: 'onRowSelection', UIEvent: $event });
    }

    get selection(): GridSelectionDto {
        if (!this.widget.custom.multiselection) {
            return null;
        }

        const list = this.elements.map((ele) => ele.item.value);
        let selected = this.configuration?.selection?.selected ? this.configuration.selection.selected : [];
        if (Array.isArray(selected)) {
            selected = selected.filter((id: string) => list.includes(id));
        } else {
            selected = list.includes(selected) ? selected : null;
        }

        return {
            multiselection: true,
            selected: selected,
            list,
        };
    }

    loadItems() {
        const items = super.loadItems();

        if (this.configuration?.selection) {

            const selected = _.clone(this.configuration.selection.selected);
            this.configuration.selection = this.selection;

            // if removed element
            if (!_.isEqual(selected, this.configuration.selection.selected)) {
                this.onSelect(false);
            }
        }

        return items;
    }

    setConfiguration() {
        this.setColumns();

        const ev = this.widget.events.find((e) => e.eventKey.toLowerCase() === 'onrowselection');
        const hasActions = ev?.pipe?.length > 0;

        this.configuration = {
            id: this.widget.id,
            search: this.widget.custom.search,
            rowHeight: this.widget.css?.row?.height?.slice(0, -2),
            headerEditable: this.widget.custom.editable,
            reorder: this.widget.custom.reorder,
            columns: this.columns,
            selection: this.selection,
            icons: [
                { key: 'any', value: 'fa-solid fa-question' },
                { key: 'string', value: 'fa-solid fa-font string' },
                { key: 'number', value: 'fa-solid fa-arrow-up-9-1 number' },
                { key: 'datetime', value: 'fa-solid fa-calendar-days datetime' },
                { key: 'date', value: 'fa-solid fa-calendar-days date' },
                { key: 'time', value: 'fa-solid fa-clock' },
                { key: 'boolean', value: 'fa-solid fa-toggle-on boolean' },
                { key: 'html', value: 'fa-solid fa-code' },
                { key: 'so:*', value: 'fa-solid fa-cube fa-blue' },
            ],
            hasActions,
            gridWidth: this.widget.box.width,
        };
    }

    setColumns() {
        const model = this.soUtils.getModelByType(this.widget.custom.collectionType, this.settingsDataService.smartmodels);

        this.columns = this.widget.group?.widgets ? this.widget.group?.widgets.map(widgetColumn => {
            const property = model?.properties.find(prop => prop.key === widgetColumn.custom.propertyKey);
            const glist = property.items ?
                  this.settingsDataService.glists.find((elem: GenericListDto) => elem.key === property.items) : null;
        
            return ({
                id: widgetColumn.id,
                key: widgetColumn.custom.propertyKey,
                name: property ? this.translateLangDto.transform(property.displayName) : widgetColumn.custom.propertyKey,
                resize: widgetColumn.custom.resize,
                filter: widgetColumn.custom.filter,
                sort: widgetColumn.custom.sort,
                type: property?.keyType,
                multiple: property.multiple,
                width: widgetColumn.box.width,
                sticky: 'none',
                custom: {
                    items: glist ? glist.values.map((elem: GenericListValueDto) => ({
                        key: elem.key,
                        value: this.translateLangDto.transform(elem.value)
                      })) : null,
                },
            } as GridColumnConfigurationDto);
        }) : [];
    }
}