import { PairDto, SearchSOFilterDto, SysQueryDto } from '@algotech/core';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GridColumnConfigurationDto } from '../../../dto/grid-column-configuration.dto';
import * as _ from 'lodash';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { GridUtilsService } from '../../../services/grid-utils.service';

@Component({
    selector: 'at-grid-column-filter',
    templateUrl: './grid-column-filter.component.html',
    styleUrls: ['./grid-column-filter.component.scss']
})

export class GridColumnFilterComponent implements AfterViewInit {

    currentQuery: SysQueryDto;
    column: GridColumnConfigurationDto;
    headerEditable: boolean;

    configurationChanged = new EventEmitter();
    queryChanged = new EventEmitter<boolean>();

    nullCriteria = {
        key: '',
        value: 'SN-FILTER.NO-FILTER'
    };
    stringCriterias = [
        { key: 'startsWith', value: 'SN-FILTER.CRITERIA.STARTS-WITH' },
        { key: 'notStartsWith', value: 'SN-FILTER.CRITERIA.NOT-STARTS-WITH' },
        { key: 'endWith', value: 'SN-FILTER.CRITERIA.END-WITH' },
        { key: 'contains', value: 'SN-FILTER.CRITERIA.CONTAINS' },
    ];

    numberCriterias = [
        { key: 'gt', value: 'SN-FILTER.CRITERIA.MORE-THAN' },
        { key: 'lt', value: 'SN-FILTER.CRITERIA.LESS-THAN' },
        { key: 'gte', value: 'SN-FILTER.CRITERIA.MORE-THAN-EQUAL' },
        { key: 'lte', value: 'SN-FILTER.CRITERIA.LESS-THAN-EQUAL' },
        { key: 'between', value: 'SN-FILTER.CRITERIA.BETWEEN' },
    ];

    genericCriterias = [
        { key: 'equals', value: 'SN-FILTER.CRITERIA.EQUALS' },
        { key: 'different', value: 'SN-FILTER.CRITERIA.DIFFERENT' },
        { key: 'isNull', value: 'SN-FILTER.CRITERIA.IS-NULL' },
        { key: 'exists', value: 'SN-FILTER.CRITERIA.EXISTS' },
    ];

    filter: SearchSOFilterDto;
    criterias: PairDto[];
    formattedType = 'text';
    indexed = true;

    constructor(private ref: ChangeDetectorRef, private soUtils: SoUtilsService, private translate: TranslateService,
        private gridUtils: GridUtilsService) { }

    ngAfterViewInit() {
        this.ref.detectChanges();

        this.filter = this.currentQuery?.filter?.find((f) => f.key === this.column.key);
        this.nullCriteria.value = this.translate.instant(this.nullCriteria.value);
        this.stringCriterias.forEach((cri) => cri.value = this.translate.instant(cri.value));
        this.numberCriterias.forEach((cri) => cri.value = this.translate.instant(cri.value));
        this.genericCriterias.forEach((cri) => cri.value = this.translate.instant(cri.value));

        switch (this.column.type) {
            case 'string':
                if (this.column.custom?.items && this.column.custom?.items.length !== 0) {
                    this.formattedType = 'select';
                    this.criterias = [this.nullCriteria, ...this.genericCriterias];
                    return;
                }
                this.criterias = [this.nullCriteria, ...this.stringCriterias, ...this.genericCriterias];
                break;
            case 'date':
            case 'time':
            case 'datetime':
            case 'number':
                this.formattedType = this.column.type;
                this.criterias = [this.nullCriteria, ...this.numberCriterias, ...this.genericCriterias];
                break;
            case 'boolean':
                this.formattedType = 'checkbox';
                this.criterias = [this.nullCriteria, ...this.genericCriterias];
                break;
            default:
                if (!this.soUtils.typeIsSmartObject(this.column.type)) {
                    this.indexed = false;
                    return;
                }
                this.criterias = [this.nullCriteria, ...this.stringCriterias, ...this.genericCriterias];
                if (this.column.multiple) {
                    this.criterias = _.reject(this.criterias, (item: PairDto) => item.key === 'notStartsWith' || item.key === 'different');
                }
        };
    }

    clickOrderItem(order: 'asc' | 'desc') {
        this.currentQuery.skip = 0;

        if (this.currentQuery.order?.length > 0 &&
            this.currentQuery.order[0].key === this.column?.key &&
            this.currentQuery.order[0].value === order) {
            this.currentQuery.order = [];
        } else {
            this.currentQuery.order = [
                { key: this.column?.key, value: order }
            ];
        }

        this.queryChanged.emit(true);
    }

    clickHide() {
        this.column.hide = true;
        this.configurationChanged.emit();
    }

    onCriteriaChanged(value: string) {
        if (!this.currentQuery.filter) {
            this.currentQuery.filter = [];
        }

        if (!value) {
            this.filter = null;
            this.currentQuery.filter = _.reject(this.currentQuery.filter, ((f) => f.key === this.column.key));

            this.queryChanged.emit(false);
            return;
        }

        if (!this.filter) {
            this.filter = {
                key: this.column.key,
                type: 'filter',
                value: {
                    criteria: value as any,
                    type: this.column.type,
                    models: this.soUtils.typeIsSmartObject(this.column.type) ? [this.column.type.replace('so:', '')] : [],
                    value: (this.formattedType !== 'select') ?
                        this.gridUtils.getDefaultValue(this.column.type) :
                        this.column.custom?.items[0].key,
                    secondValue: this.gridUtils.getDefaultValue(this.column.type),
                }
            };
            this.currentQuery.filter.push(this.filter);
        } else {
            this.filter.value.criteria = value as any;
        }
        if ((this.filter.value.criteria === 'equals' || this.filter.value.criteria === 'different') && this.formattedType === 'select') {
            this.filter.value.value = this.column.custom?.items[0].key;
        }
        if (this.filter.value.criteria === 'exists' || this.filter.value.criteria === 'isNull') {
            this.filter.value.value = this.gridUtils.getDefaultValue(this.column.type);
        }
        if (this.filter.value.criteria !== 'between') {
            this.filter.value.secondValue = this.gridUtils.getDefaultValue(this.column.type);
        }

        this.currentQuery.filter = [...this.currentQuery.filter];
        this.queryChanged.emit(false);
    }

    onValueChanged(value: any) {
        this.filter.value.value = this.soUtils.formatProperty(this.column.type, value);
        this.queryChanged.emit(false);
    }

    onSecondValueChanged(value: any) {
        this.filter.value.secondValue = this.soUtils.formatProperty(this.column.type, value);
        this.queryChanged.emit(false);
    }
}
