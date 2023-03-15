import { Component, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { LangDto, SmartPropertyObjectDto } from '@algotech/core';
import { Observable, Subject, zip, of, Subscription } from 'rxjs';
import { debounceTime, map, mergeMap, tap, catchError } from 'rxjs/operators';
import { ISoItemObject } from '../so-item/so-item.interface';
import * as _ from 'lodash';
import { AuthService, GestionDisplaySettingsService, TranslateLangDtoService } from '@algotech/angular';
import { SysUtilsService } from '../../../workflow-interpretor/@utils/sys-utils.service';
import { SoUtilsService } from '../../../workflow-interpretor/@utils/so-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomResolverParams } from '../../../../../interpretor/src';

@Component({
    selector: 'at-so-list',
    templateUrl: './so-list.component.html',
    styleUrls: ['./so-list.component.scss']
})
export class SoListComponent implements OnChanges {
    @Input()
    columnsDisplay: string[] = [];

    @Input()
    items: any[] = [];

    @Input()
    searchVisible = false;

    @Input()
    multipleSelection = false;

    @Input()
    mode: 'check' | 'cart' = 'cart';

    @Input()
    type = 'so:';

    @Input()
    excludeObjects: string[] = [];

    @Input()
    getItems: (params?: CustomResolverParams) => Observable<any>;

    @Input() filterProperty: string;

    @Input() pagination: boolean;

    @Input() isFilterProperty = false;
    @Input() searchValue = '';

    @Output() changeValue = new EventEmitter<{ value: any | any[], valid: boolean }>();
    @Output() handleError = new EventEmitter<string>();
    @Output() showToast = new EventEmitter<string>();

    cartView = false;
    cart: ISoItemObject[] = [];
    elements: ISoItemObject[] = [];
    moreDataToLoad = false;
    pageDefaultSize = 10;
    page = -1;
    isLoading = false;
    filterPropertyDisplay: LangDto[];

    obsSearch = new Subject();

    constructor(
        private ref: ChangeDetectorRef,
        private soUtils: SoUtilsService,
        private auth: AuthService,
        private sysUtils: SysUtilsService,
        private translate: TranslateService,
        private translateLang: TranslateLangDtoService,
        private gestionDisplaySettings: GestionDisplaySettingsService,
    ) {
        let subscription: Subscription = null;
        this.obsSearch.pipe(
            debounceTime(150),
            tap(() => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            }),
            tap(() => {
                this.elements = [];
                this.page = -1;
                subscription = this.load().subscribe();
                if (this.multipleSelection) {
                    this.changeValue.emit({ value: [], valid: true });
                }
            })).subscribe();
    }

    ngOnChanges() {
        if (this.getItems) {
            this.load().subscribe();
        }

        if (this.items) {
            this.loadListElements(this.items).pipe()
                .subscribe((elem: ISoItemObject[]) => {
                    this.cart = elem;
                });
        }

        if (this.filterProperty) {
            if (this.type.includes('so:')) {
                const modelKey = this.type.substr(3);
                const property = this.soUtils.getSmartModelProperty(modelKey, this.filterProperty);
                if (property) {
                    this.filterPropertyDisplay = property.displayName;
                    this.showToastFilter();
                }
            }
        }
    }

    loadMore() {
        this.load().subscribe();
    }

    load() {
        this.isLoading = true;

        return this.loadElements(this.getListParameters(this.page + 1)).pipe(
            catchError((e) => {
                this.handleError.emit(e.message);
                return of([]);
            }),
            map((lstSo: ISoItemObject[]) => {
                if (lstSo && lstSo.length > 0) {
                    this.elements.push(...lstSo);
                    this.page++;
                    this.moreDataToLoad = (lstSo.length === this.pageDefaultSize) && this.type.startsWith('so:');
                } else {
                    this.moreDataToLoad = false;
                }
                this.isLoading = false;
            }),
            tap(() => {
                if (this.filterProperty && this.isFilterProperty) {
                    this.elements = this._filterByPropertyElements();
                }
            }),
        );
    }

    cartClick() {
        this.cartView = !this.cartView;
        this.ref.detectChanges();
        const content = document.querySelector('.at-list-content');
        if (content) {
            content.scrollTop = 0;
        }
    }

    filterElements() {
        this.cartView = false;
        this.obsSearch.next(null);
    }

    onDelete(elt: ISoItemObject) {
        const index = _.findIndex(this.cart, (b) => b.data.uuid === elt.data.uuid);
        const findElt = _.find(this.elements, (e) => e.data.uuid === elt.data.uuid);

        if (index > -1) {
            this.cart.splice(index, 1);
        }

        if (findElt) {
            findElt.deletable = false;
        }
        const items = _.map(this.cart, (c) => c.data);
        this.changeValue.emit({ value: items, valid: true });
    }

    onSelect(elt: ISoItemObject) {
        if (this.multipleSelection) {
            switch (this.mode) {
                case 'check':
                    elt.checked = !elt.checked;
                    const itemsChecked = _.map(this.elements.filter((e) => e.checked), (e) => e.data);
                    this.changeValue.emit({ value: itemsChecked, valid: true });
                    break;
                case 'cart':
                    elt.deletable = true;
                    this.cart.push(elt);
                    const items = _.map(this.cart, (b) => b.data);
                    this.changeValue.emit({ value: items, valid: true });
                    break;
            }
        } else {
            this.changeValue.emit({ value: elt.data, valid: true });
        }
    }

    loadListElements(list: any[]): Observable<ISoItemObject[]> {
        const ls: Observable<ISoItemObject>[] = _.map(list, (data) => {
            return this.loadElementInfo(data);
        });
        if (ls.length === 0) { return of([]); }
        return zip(...ls);
    }

    loadElements(parameters: CustomResolverParams): Observable<ISoItemObject[]> {
        return this.getItems(parameters).pipe(
            mergeMap((list: []) => {
                return this.loadListElements(list);
            })
        );
    }

    elementExistsInExclude(data) {
        return (this.excludeObjects.indexOf(data.uuid) > -1);
    }

    loadElementInfo(data: any): Observable<ISoItemObject> {
        if (this.type.includes('so:')) {
            const deletable = _.find(this.cart, (b) => b.data.uuid === data.uuid) !== undefined;
            const cbFindSo = (uuid) => of(_.find(_.map(this.items, (item) => item.data), (so) => so.uuid === uuid));
            return zip(
                this.gestionDisplaySettings.validateNameFromSettings(data, 'icon', cbFindSo),
                this.gestionDisplaySettings.validateNameFromSettings(data, 'primary', cbFindSo),
                this.gestionDisplaySettings.validateNameFromSettings(data, 'secondary', cbFindSo),
                this.gestionDisplaySettings.validateNameFromSettings(data, 'tertiary', cbFindSo),
            ).pipe(
                map((valuesData) => {
                    const icon = valuesData[0];
                    if (this.columnsDisplay && this.columnsDisplay.length > 0) {
                        const ele: ISoItemObject = {
                            checked: false,
                            data,
                            prop1: this.soUtils.getPropertyDisplay(data, this.columnsDisplay[0]),
                            prop2: this.soUtils.getPropertyDisplay(data, this.columnsDisplay[1]),
                            prop3: this.soUtils.getPropertyDisplay(data, this.columnsDisplay[2]),
                            icon: icon ? icon : 'fa-solid fa-cube',
                            deletable,
                            disable: this.elementExistsInExclude(data),
                        };
                        return ele;
                    } else {
                        const ele: ISoItemObject = {
                            checked: false,
                            data,
                            prop1: valuesData[1],
                            prop2: valuesData[2],
                            prop3: valuesData[3],
                            icon: icon ? icon : 'fa-solid fa-cube',
                            deletable,
                            disable: this.elementExistsInExclude(data),
                        };
                        return ele;
                    }
                }
                ));
        } else {
            const _data = this.sysUtils.transform(data, this.type, this.auth.localProfil.preferedLang);
            const deletable = _.find(this.cart, (b) => b.data.uuid === data.uuid) !== undefined;
            switch (this.type) {
                case 'sys:workflow':
                    const wf: ISoItemObject = {
                        checked: false,
                        data: _data,
                        prop1: _data.displayName,
                        prop2: _data.description,
                        icon: _data.iconName,
                        deletable
                    };
                    return of(wf);
                case 'sys:schedule':
                    const sc: ISoItemObject = {
                        checked: false,
                        data: _data,
                        prop1: _data.title,
                        prop2: _data.scheduleTypeKey,
                        icon: 'fa-solid fa-calendar',
                        deletable: deletable
                    };
                    return of(sc);
                case 'sys:user':
                    const us: ISoItemObject = {
                        checked: false,
                        data: _data,
                        prop1: `${_data.firstName} ${_data.lastName}`,
                        prop2: _data.email,
                        icon: 'fa-solid fa-user',
                        deletable: deletable
                    };
                    return of(us);
                case 'sys:location':
                    const lc: ISoItemObject = {
                        checked: false,
                        data: _data,
                        prop1: _data.layerKey,
                        icon: 'fa-solid fa-location-dot',
                        deletable,
                    };
                    return of(lc);
                case 'sys:file': {
                    const fi: ISoItemObject = {
                        checked: false,
                        data: _data,
                        prop1: _data.name,
                        prop2: _data.reason,
                        prop3: _data.ext,
                        icon: 'fa-solid fa-file',
                        deletable: deletable,
                    };
                    return of(fi);
                }
                case 'sys:magnet': {
                    const fi: ISoItemObject = {
                        checked: false,
                        data: _data,
                        prop1: this.translateLang.transform(_data.app?.displayName),
                        icon: _data.app?.snApp?.environment === 'web' ? 'fa-solid fa-window-maximize' : 'fa-solid fa-mobile',
                        deletable: deletable,
                    };
                    return of(fi);
                }
                default:
                    this.handleError.emit(`type ${this.type} unsupported`);
            }
        }
    }

    getListParameters(page: number): CustomResolverParams {
        const res: CustomResolverParams = {
            searchParameters: {
                search: this.searchVisible && this.searchValue ? this.searchValue : undefined,
                skip: this.pagination ? page : undefined,
                limit: this.pagination ? this.pageDefaultSize : undefined,
            }
        }
        return res;
    }

    showToastFilter() {
        if (!this.filterPropertyDisplay) {
            return;
        }
        this.showToast.emit(this.translate.instant(`SN-LIST-FILTER-${this.isFilterProperty ? 'ENABLED' : 'DISABLED'}`,
            { property: this.translateLang.transform(this.filterPropertyDisplay) }));
    }

    filterClick() {
        this.isFilterProperty = !this.isFilterProperty;
        this.filterList();
        this.showToastFilter();
    }

    filterList() {
        if (this.filterProperty && this.isFilterProperty) {
            this.elements = this._filterByPropertyElements();
        } else {
            this.elements = [];
            this.page = -1;
            this.load().subscribe();
        }
    }

    _filterByPropertyElements(): ISoItemObject[] {
        return _.filter(this.elements, (element: ISoItemObject) => {
            const property = _.find(element.data.properties, (prop: SmartPropertyObjectDto) => prop.key === this.filterProperty);
            return property ? property.value : false;
        });
    }

}

