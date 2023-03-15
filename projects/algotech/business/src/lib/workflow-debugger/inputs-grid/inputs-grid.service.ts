import { Injectable, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import {
    PairDto, GeoDto, PlanContainersSettingsDto, PlanLayersSettingsDto, QuerySearchResultDto, SmartObjectDto, DocumentDto,
    QuerySearchDto, UserDto, ScheduleDto, ApplicationModelDto, SnPageWidgetDto, SnAppDto,
} from '@algotech/core';
import {
    SettingsDataService, UsersService, ScheduleService, SmartObjectsService, DocumentsService,
} from '@algotech/angular';
import { ModalController } from '@ionic/angular';
import { from, throwError, of, zip, Observable } from 'rxjs';
import { InputsSearchComponent } from './inputs-search/inputs-search.component';
import { mergeMap, tap, catchError, map } from 'rxjs/operators';
import { SoUtilsService } from '../../workflow-interpretor/@utils/so-utils.service';
import { InputDisplay } from './dto/input-display.dto';
import moment from 'moment';
import { SysUtilsService } from '../../workflow-interpretor/@utils/sys-utils.service';
import { CustomResolverParams, InterpretorService } from '../../../../interpretor/src';


const SEARCH_LIMIT = 20;

@Injectable()
export class InputsGridService {

    constructor(
        private settingsDataService: SettingsDataService,
        private modalController: ModalController,
        private userService: UsersService,
        private scheduleService: ScheduleService,
        private soUtils: SoUtilsService,
        private smartObjectsService: SmartObjectsService,
        private documentServices: DocumentsService,
        private sysUtils: SysUtilsService,
        ) { }

    transformDatas(objects: any, type: string): any[] {
        return _.map(objects, (obj) => {
            return this.sysUtils.transform(obj, type);
        });
    }

    scheduleDates(): PairDto[] {
        return [
            {
                key: 'start',
                value: moment(new Date()).startOf('year').toISOString()
            },
            {
                key: 'end',
                value:  moment(new Date()).endOf('year').toISOString()
            }
        ];
    }

    getLocations(): GeoDto[] {
        const layers: PlanLayersSettingsDto[] = this.returnLayers();
        return _.map(layers, (lay: PlanLayersSettingsDto) => {
            const location: GeoDto = {
                geometries: [
                   {
                       type: 'plan',
                       coordinates: [0, 0]
                   },
                ],
                uuid: lay.uuid,
                layerKey: lay.key
            };
            return location;
        });
    }

    returnLayers(): PlanLayersSettingsDto[] {
        const lays = _.reduce(this.settingsDataService.settings.plan.containers, (result, cont: PlanContainersSettingsDto) => {
            if (cont.layers.length !== 0) {
                result.push(...cont.layers);
            }
            return result;
        }, []);
        return lays;
    }

    isSearchVisible(inputs: InputDisplay[], type: string): boolean {
        if (inputs && type === 'sys:file') {
            return (this.findDisplay(inputs, 'smart-object-selected')) ? false : true;
        } else {
            return (['sys:user', 'sys:location', 'sys:schedule'].includes(type)) ? false : true;
        }
    }

    public searchObject(inputs: InputDisplay[], type: string, multiple = false, items: any[] = []): Observable<any> {
        const onChangeValue = new EventEmitter<any>();

        return from(this.modalController.create({
            component: InputsSearchComponent,
            componentProps: {
                getItems: ((params?: CustomResolverParams) => {
                    return this.getItems(type, params, inputs);
                }),
                multiple,
                items,
                searchVisible: this.isSearchVisible(inputs , type),
                listType: (type.startsWith('sk')) ? 'so:*' : type,
                changeValue: onChangeValue,
            },
        })).pipe(
            mergeMap((modal: HTMLIonModalElement) => from(modal.present())),
            mergeMap(() => onChangeValue),
            tap(() => {
                this.modalController.dismiss();
            }),
            catchError((err) => throwError(err))
        );
    }

    validateDiv(type: string, inputs: InputDisplay[]): boolean {
        const findSO: InputDisplay = this.findDisplay(inputs, 'smart-object-selected');
        return (!findSO) ? false : (type === 'sys:file' && !findSO.value);
    }

    findDisplay(inputs: InputDisplay[], key: string): InputDisplay {
        return  _.find(inputs, (input) => input.key === key);
    }


    updateInput(inputs: InputDisplay[], value: any, key: string) {
        const find: InputDisplay = this.findDisplay(inputs, key);
        if (find) {
            find.value = value;
        }
    }

    findSODisplay(inputs: InputDisplay[]): SmartObjectDto {
        const findSO: InputDisplay = this.findDisplay(inputs, 'smart-object-selected');
        if (findSO) {
            return _.isArray(findSO.value) && findSO.value.length > 0 ? findSO.value[0] : findSO.value;
        }
        return null;
    }

    private getItems(type: string, params: CustomResolverParams, inputs: InputDisplay[]): Observable<any> {
        switch (type) {
            case 'sys:file':
                const findSO: SmartObjectDto = this.findSODisplay(inputs);
                if (findSO) {
                    return this.smartObjectsService.getDocuments(findSO);
                } else {
                    const search: string = params?.searchParameters?.search;
                    if (!search) {
                        return of([]);
                    }
                    return this.searchDocuments$(search ? search : '', []);
                }
            case 'sys:user':
                return this.userService.list();
            case 'sys:schedule':
                const dates: PairDto[] = this.scheduleDates();
                return this.scheduleService.getBetween(dates[0].value, dates[1].value).pipe(
                    map((schedules: ScheduleDto[]) => {
                        return this.transformDatas(schedules, type);
                    })
                );
            case 'sys:location':
                const locations: GeoDto[] = this.getLocations();
                return of(locations);
            case 'sys:magnet':
                const applications: { app: ApplicationModelDto, zones: SnPageWidgetDto[] }[] = _.reduce(
                    this.settingsDataService.apps, (res, app: ApplicationModelDto) => {
                        const zones: SnPageWidgetDto[] = this.getAppZones(app.snApp);
                        if (zones.length > 0) {
                            res.push({
                                app,
                                zones,
                            });
                        }
                        return res;
                    }, []);
                return of(applications);
            default: {
                const search: string = params?.searchParameters?.search;
                if (!search) {
                    return of([]);
                }
                if (type === 'so:*') {
                    return this.searchAll(search ? search : '', []);
                } else if (type.startsWith('so:')) {
                    return this.smartObjectsService.searchByProperty(type.replace('so:', ''), null, search ? search : null, InterpretorService.paramsToPair(params));
                } else if (type.startsWith('sk:')) {
                    return this.searchAll(search ? search : '',
                        _.map(this.soUtils.getModelsBySkill(type, this.settingsDataService.smartmodels), (sm) => {
                            return sm.key;
                        }));
                }
                return of([]);
            }
        }
    }

    searchDocuments$(search: string, models: string[]): Observable<DocumentDto[]> {
        return this.smartObjectsService.querySearch(this.createQuerySeach(search, models), 0, SEARCH_LIMIT, 'file:').pipe(
            mergeMap((res: QuerySearchResultDto[]) => {
                if ((!res || !res[0]) || (!res[0].header || res[0].header.type !== 'file')
                    || (!res[0].values || res[0].values.length === 0)) { return of([]); }
                const docsId: string[] = _.map(res[0].values, (r) => r._id);
                const getDocuments$: Observable<DocumentDto>[] = _.map(docsId, (id: string) => {
                    return this.documentServices.get(id).pipe(catchError(() => of([])));
                });
                return zip(...getDocuments$);
            }),
            map((docs: DocumentDto[]) => {
                return docs;
            })
        );
    }

    searchAll(search: string, models: string[]) {
        return this.smartObjectsService.querySearch(this.createQuerySeach(search, models), 0, SEARCH_LIMIT).pipe(
            map((queryResults: QuerySearchResultDto[]) => {
                return _.reduce(queryResults, (results, queryResult: QuerySearchResultDto) => {
                    if (queryResult.header.type === 'so') {
                        const values: SmartObjectDto[] = queryResult.values as SmartObjectDto[];
                        results.push(...values);
                    }
                    return results;
                }, []);
            }),
        );
    }

    createQuerySeach(search: string, models: string[] ) {
        const querySearch: QuerySearchDto = {
            caseSensitive: false,
            exactValue: false,
            layers: [],
            so: _.map(models, (modelKey) => {
                return {
                    modelKey,
                    props: [],
                };
            }),
            tags: [],
            metadatas: [],
            target: '',
            texts: [search]
        };
        return querySearch;
    }

    getAppZones(app: SnAppDto): SnPageWidgetDto[] {
        const allWidgets = this.getWidgets(app);
        return _.filter(allWidgets, (w: SnPageWidgetDto) => w.typeKey === 'zone');
    }

    private getWidgets(app: SnAppDto): SnPageWidgetDto[] {
        return app.pages.reduce((results, p) => {
            results.push(...p.widgets);
            for (const widget of p.widgets) {
                results.push(...this.getChilds(widget));
            }
            return results;
        }, []);
    }

    private getChilds(widget: SnPageWidgetDto, deep = true) {
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

}
