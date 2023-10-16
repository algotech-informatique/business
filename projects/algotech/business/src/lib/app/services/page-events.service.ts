import { Router } from '@angular/router';
import { SmartFlowsService, SmartObjectsService, CacheNotFindError, SettingsDataService, DataService } from '@algotech-ce/angular';
import {
    ApplicationModelDto,
    CrudDto, DocumentDto, PairDto, SysQueryDto, SmartObjectDto, SnPageDto, SnPageEventDto, SnPageEventPipeDto,
    SnPageWidgetDto,
    WorkflowDataDto, WorkflowInstanceDto, WorkflowStackTaskDto, WorkflowTaskActionDto, SearchSODto
} from '@algotech-ce/core';
import { EventEmitter, Injectable, Injector } from '@angular/core';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Observable, of, Subject, zip, ReplaySubject, from, throwError } from 'rxjs';
import { WorkflowLaunchService } from '../../workflow-launcher/workflow-layout.lancher.service';
import { ActionsLauncherData, ActionsLauncherEvent, EventData, EventResolver, PageData } from '../models';
import { WorkflowErrorSmartObjectNotFind } from '../../../../interpretor/src';
import { SocketSmartObjectsService } from './sockets-smart-objects.service';
import { SoUtilsService } from '../../workflow-interpretor/@utils/so-utils.service';
import { WorkflowSoService } from '../../workflow-interpretor/workflow-reader/workflow-so/workflow-so.service';
import { SocketDocumentsService } from './sockets-documents.service';
import { DSResolver } from '../models/ds-resolver';
import { EventOptions } from '../models/event-options';
import { PageCustomService } from './page-custom.service';
import { ToastService } from '../../@services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { PageUtilsService } from './page-utils.service';
import { ActionsLauncherComponent } from '../components/actions-launcher/actions-launcher.component';
import { ModalController, PopoverController, PopoverOptions } from '@ionic/angular';

@Injectable()
export class PageEventsService {

    /** public for test */
    _data: PageData[] = [];
    private requests: PairDto[] = [];

    smartobjects: SmartObjectDto[] = [];
    documents: DocumentDto[] = [];
    changed = new Subject<PageData>();
    unload = new Subject<string>();

    constructor(
        private injector: Injector,
        private workflowLauncher: WorkflowLaunchService,
        private workflowSo: WorkflowSoService,
        private pageUtils: PageUtilsService,
        private smartflowService: SmartFlowsService,
        private smartObjectsService: SmartObjectsService,
        private soUtils: SoUtilsService,
        private socketSmartObjects: SocketSmartObjectsService,
        private socketDocuments: SocketDocumentsService,
        private dataService: DataService,
        private settingsDataService: SettingsDataService,
        private translate: TranslateService,
        private toastService: ToastService,
        private modalController: ModalController,
        private popoverController: PopoverController,
        private router: Router) {

        this.socketSmartObjects.onChange((smartObject: SmartObjectDto) => {
            this.pushObjects([smartObject]);
            this.changed.next(null);
        });
        this.socketSmartObjects.onRemove((uuid: string) => {
            this.smartobjects = _.reject(this.smartobjects, { uuid });
            for (const dataList of this._data.filter((d) => Array.isArray(d.value))) {
                dataList.value = _.reject(dataList.value, (d) => d === uuid);
            }
            this.changed.next(null);
        });
        this.socketDocuments.onAdd((res: { uuid: string, document: DocumentDto }) => {
            const smartObject = this.smartobjects.find((so) => so.uuid === res.uuid);
            if (!smartObject) {
                return;
            }
            smartObject.skills.atDocument.documents.unshift(res.document.uuid);
            this.pushDocuments([res.document]);
            this.changed.next(null);
        });
        this.socketDocuments.onChange((document: DocumentDto) => {
            this.pushDocuments([document]);
            this.changed.next(null);
        });
        this.socketDocuments.onRemove((res: { uuid: string, documentsID: string[] }) => {
            this.documents = _.reject(this.documents, ((document: DocumentDto) => res.documentsID.includes(document.uuid)));
            this.changed.next(null);
        })
    }

    pushObjects(smartObjects: SmartObjectDto[]) {
        this.smartobjects = _.uniqBy([
            ...smartObjects,
            ...this.smartobjects,
        ], 'uuid');
    }

    pushDocuments(documents: DocumentDto[]) {
        this.documents = _.uniqBy([
            ...documents,
            ...this.documents,
        ], 'uuid');
    }

    getData(item: PageData): PageData[] {
        if (item) {
            if (item.key === 'current-list.item') {
                return [item, ...this._data];
            }
            return this._data.reduce((results, d) => {
                if (d.key === item.key) {
                    const _item: PageData = {
                        key: 'current-list.item',
                        value: item.value,
                        type: item.type,
                    };
                    results.push(_item);
                }
                results.push(d);
                return results;
            }, []);
        }
        return this._data;
    }

    exists(item: PageData) {
        return this._data.some((d) => d.key === item.key);
    }

    resolveEvents(appModel: ApplicationModelDto, snPage: SnPageDto, events: SnPageEventDto[], readonly: boolean,
        item?: PageData, searchParameters?: SysQueryDto, options: EventOptions = { cumul: false, notify: true }): EventResolver[] {
        return _.reduce(events, (results: EventResolver[], ev: SnPageEventDto) => {
            const action$ = this.resolveEvent(appModel, snPage, ev, readonly, item, options, searchParameters);

            if (action$) {
                results.push({
                    key: ev.eventKey,
                    action$: action$
                });
            }
            return results;
        }, []);
    }

    resolveEvent(appModel: ApplicationModelDto, snPage: SnPageDto, event: SnPageEventDto, readonly: boolean, item: PageData,
        options: EventOptions, searchParameters?: SysQueryDto) {
        if (event.pipe.length === 0) {
            return null;
        }

        if (event.custom?.mode === 'list') {
            return (UIEvent?: Event) => this.executeList(UIEvent, appModel, snPage, event, readonly, options, item, searchParameters);
        }

        const resolve = this.resolvePipeEvent(appModel, snPage, event.pipe[0], readonly, options, item, searchParameters);
        if (!resolve) {
            return null;
        }
        const action$: Observable<any> = resolve.pipe(
            mergeMap(() => {
                const _event = _.cloneDeep(event);
                _event.pipe.shift();
                if (_event.pipe.length === 0) {
                    return of({});
                }
                return this.resolveEvent(appModel, snPage, _event, readonly, item, options, searchParameters)();
            }),
            catchError(() => of({})), // stop sequence
        );
        return () => action$;
    }

    resolvePipeEvent(appModel: ApplicationModelDto, snPage: SnPageDto, event: SnPageEventPipeDto,
        readonly: boolean, options: EventOptions, item?: PageData, searchParameters?: SysQueryDto): Observable<any> {
        let event$ = null;
        switch (event.type) {
            case 'smartobjects':
                event$ = this.executeSmartobjects(event, item, options, searchParameters);
                break;
            case 'smartflow':
                event$ = this.executeSmartflow(appModel, snPage, event, readonly, item, options, searchParameters);
                break;
            case 'workflow':
                event$ = this.executeWorkflow(appModel, snPage, event, readonly, item);
                break;
            case 'page':
            case 'page::nav':
                event$ = this.executePage(appModel, snPage, event, readonly, item);
                break;
            case 'url':
                event$ = this.executeUrl(appModel, snPage, event, readonly, item);
                break;
            case 'call::onLoad':
                event$ = this._executeRefresh(appModel, snPage, event);
                break;
            default:
                break;
        }

        return event$ ? event$.pipe(
            catchError((e) => this.handleError(e)),
        ) : null;
    }

    handleError(e) {
        if (e instanceof CacheNotFindError) {
            this.toastService.presentToast(this.translate.instant('DATA-NOT-AVAILABLE-ON-CACHE'), 5000, 'danger');
            return of(null);
        }
        return throwError(e);
    }

    launchEvent(events: EventResolver[], event: EventData) {
        const findEvent = (event.inherit ? event.inherit : events).find((e) => e.key?.toUpperCase() === event.key?.toUpperCase());
        if (!findEvent) {
            return of({});
        }
        return findEvent.action$(event.UIEvent);
    }

    notifyWidgetDataChanged(page: SnPageDto, widget: SnPageWidgetDto, data: PairDto) {
        const type = widget.returnData.find((d) => d.key === data.key);
        if (!type) {
            return;
        }

        const key = `widget.${widget.id}::${data.key}`;

        const dataSources = page.dataSources.filter((ds) => ds.inputs.some((input) => _.isString(input.value) && input.value.includes(key)));
        this.unloadDataSources(dataSources);

        this._pushData(Object.assign(data, {
            key,
            type: type.type,
        }) as PageData, { notify: true });
    }

    resolveInputs(data: WorkflowDataDto[]): Observable<any> {
        return this.workflowSo.downloadData(data, [], [...this.documents], this.settingsDataService.smartmodels).pipe(
            map((res) => {
                this.pushObjects(res.smartObjects);
                this.pushDocuments(res.documents);
                for (const d of data) {
                    this._pushData(d, { notify: false });
                }
                return data;
            }),
        );
    }

    resolveDataSource(dsKey: string, context: DSResolver): Observable<any> {
        const dataSource = context.snPage.dataSources.find((ev) => dsKey === `datasource.${ev?.key}`);
        if (!dataSource) {
            return of(null);
        }
        const event = this.resolvePipeEvent(context.appModel, context.snPage, dataSource, context.readonly, { cumul: false, notify: false },
            context.item, context.searchParameters);
        if (!event) {
            return of(null);
        }

        return event;
    }

    unloadDataSources(dataSources?: SnPageEventPipeDto[], widget?: SnPageWidgetDto) {
        this.requests = [];
        const intersectData = dataSources ?
            this._data.filter((data) => dataSources.some((ds) => data.key === `datasource.${ds.key}`)) : this._data;
        for (const data of intersectData) {
            data.unloaded = true;
            data.unloadedRelativeTo = widget;
        }
    }

    private executeSmartobjects(ev: SnPageEventPipeDto, item: PageData, options: EventOptions, searchParameters?: SysQueryDto): Observable<PageData> {

        const subject = new ReplaySubject(); // replay last value after next
        const key = `datasource.${ev.key}`;

        const search: SearchSODto = {
            modelKey: ev.action,
            order: [],
            filter: [],
            searchParameters,
        };

        return this.smartObjectsService.QuerySearchSO(search, null, null, null, true).pipe(
            map((listSO: SmartObjectDto[]) => {
                if (listSO) {
                    this.pushObjects(listSO);
                }

                const listValue: string[] = _.map(listSO, (so: SmartObjectDto) => {
                    return so.uuid;
                });
                const output: PageData = {
                    key: key,
                    type: `so:${ev.action}`,
                    value: listValue,
                };
                this._pushData(output, options);
                subject.next(output);
                return output;
            })
        );
    }

    private executeSmartflow(appModel: ApplicationModelDto, snPage: SnPageDto, ev: SnPageEventPipeDto, readonly: boolean,
        item: PageData, options: EventOptions, searchParameters?: SysQueryDto): Observable<PageData> {
        const key = ev.key ? `datasource.${ev.key}` : `smartflow.${ev.id}`;
        const subject = new ReplaySubject(); // replay last value after next

        return this.createInputs(appModel, snPage, readonly, ev.inputs, item).pipe(
            mergeMap((inputs: PairDto[]) => {

                inputs = _.uniqBy([...inputs, ...this.workflowLauncher.computeParameters()], 'key');

                const findRequest = this.optimizeRequest(snPage, ev, inputs, key, subject, options, searchParameters);
                if (findRequest) {
                    return findRequest;
                }

                return this.smartflowService.start({
                    key: ev.action,
                    inputs,
                    readonly,
                    toData: true,
                    searchParameters
                }).pipe(
                    map((result) => {
                        const output: PageData = {
                            key,
                            value: result.data,
                            type: result.type,
                        };

                        if (result.smartobjects) {
                            this.pushObjects(result.smartobjects);
                        }

                        this._pushData(output, options);
                        subject.next(output);
                        return output;
                    }));
            }),
        );
    }

    private optimizeRequest(snPage: SnPageDto, ev: SnPageEventPipeDto, inputs: PairDto[], key: string, subject, options: EventOptions,
        searchParameters: SysQueryDto) {
        // current request
        const requestKey = this.uniqRequestKey(snPage, ev.action, [...inputs, { key: 'searchParameters', value: searchParameters }]);
        const findRequest = this.requests.find((d) => d.key === requestKey);
        if (findRequest) {

            return (findRequest.value.asObservable() as Observable<PageData>).pipe(
                map((data: PageData) => {
                    // push N data, 1 request
                    const newData = Object.assign(_.cloneDeep(data), { key });
                    this._pushData(newData, options);
                    return newData;
                })
            );
        }

        // new smartflow
        this.requests.push({
            key: requestKey,
            value: subject,
        });

        setTimeout(() => {
            _.remove(this.requests, { key: requestKey });
        }, 1000);

        return null;
    }

    private uniqRequestKey(snPage: SnPageDto, key: string, inputs: PairDto[]) {
        return `${snPage.id}${key}${JSON.stringify(inputs)}`;
    }

    private executeUrl(appModel: ApplicationModelDto, snPage: SnPageDto, ev: SnPageEventPipeDto, readonly: boolean, item: PageData) {

        return new Observable((observer) => {
            observer.next();
        }).pipe(
            mergeMap(() =>
                this.injector.get(PageCustomService).calculateValue('url', ev.action, false, item, { appModel, snPage, readonly, item }, true)
            ),
            map((url: string) => {
                return window.open(url, '_blank');
            }),
        );
    }

    popoverEventPosition(ev): any {
        // fix open ionic popup whith zoom css option
        return !ev || !ev.x ? null : { clientY: ev.y, clientX: ev.x,
            target: { getBoundingClientRect: () => ({ left: ev.x, bottom: ev.y, top: 0 }) } };
    }

    private executeList(UIEvent: Event, appModel: ApplicationModelDto, snPage: SnPageDto, event: SnPageEventDto,
        readonly: boolean, options: EventOptions, item: PageData, searchParameters?: SysQueryDto) {
        return new Observable((observer) => {

            const launched = new EventEmitter<any>();
            const closed = new EventEmitter<any>();
            const actions: ActionsLauncherData[] = event.pipe.map((action) => ({
                action,
                inputs: this.createInputs(appModel, snPage, readonly, action.inputs, item).pipe(
                    map((inputs) => _.uniqBy([...inputs, ...this.workflowLauncher.computeParameters()], 'key'))
                )
            }));
            const paramController: PopoverOptions = {
                component: ActionsLauncherComponent,
                componentProps: {
                    launched,
                    appModel,
                    closed,
                    actions
                },
                reference: 'event',
                cssClass: 'workflow-launcher',
                event: this.popoverEventPosition(UIEvent)
            };
            const pageCtrl = this.dataService.mobile ? this.modalController : this.popoverController;
            from(pageCtrl.create(paramController)).pipe(
                mergeMap((popover) => from(popover.present())),
            ).subscribe();

            closed.subscribe(() => {
                pageCtrl.dismiss();
                observer.next();
                observer.complete();
            })

            launched.subscribe((data: ActionsLauncherEvent) => {
                pageCtrl.dismiss();
                if (data.instance) {
                    this.workflowLauncher.launchInstance(data.instance, (instance: WorkflowInstanceDto) => {
                        this.finalizeWorkflow(instance);
                        observer.next();
                        observer.complete();
                    });
                } else {
                    this.resolvePipeEvent(appModel, snPage, data.action, readonly, options, item, searchParameters).subscribe(() => {
                        observer.next();
                        observer.complete();
                    })
                }
            });
        })
    }

    private executeWorkflow(appModel: ApplicationModelDto, snPage: SnPageDto, ev: SnPageEventPipeDto, readonly: boolean, item: PageData) {
        return new Observable((observer) => {

            this.createInputs(appModel, snPage, readonly, ev.inputs, item).subscribe(
                ((inputs: PairDto[]) => {

                    const source = _.uniqBy([...inputs, ...this.workflowLauncher.computeParameters()], 'key');
                    const settings = this.workflowLauncher.getAvailableWorkflowsAppAction(ev, source);
                    if (!settings) {
                        observer.error(new Error('no settings found for workflow'));
                        return;
                    }
                    if (readonly) {
                        settings.savingMode = 'DEBUG';
                    }

                    this.workflowLauncher.launch({
                        workflowModelKey: ev.action,
                        inputs: _.uniqBy([...inputs, ...this.workflowLauncher.computeParameters()], 'key'),
                        settings
                    }, (instance: WorkflowInstanceDto) => {
                        setTimeout(() => {
                            // wait for popup closed
                            this.finalizeWorkflow(instance);
                            observer.next();
                        }, 0);
                    });
                }), ((e) => {
                    setTimeout(() => {
                        // wait for popup closed
                        if (e instanceof WorkflowErrorSmartObjectNotFind) {
                            observer.next();
                        }
                        observer.error();
                    }, 0);
                }),
            );
        });
    }

    private finalizeWorkflow(instance: WorkflowInstanceDto) {
        // update data after workflow finished
        if (instance.state === 'finished') {

            // patches
            this.pushObjects(instance.smartobjects);
            this.pushDocuments(instance.documents);

            // add, delete => update data
            const actions = instance.stackTasks.reduce((results, task: WorkflowStackTaskDto) => {
                results.remove.push(
                    ..._.map(task.operations.filter((op) =>
                        op.type === 'action' && (<WorkflowTaskActionDto>op.value).actionKey === 'delete' && op.saveOnApi), 'value'
                    )
                );
                results.add.push(
                    ..._.map(task.operations.filter((op) =>
                        op.type === 'crud' && (<CrudDto>op.value).collection === 'smartobjects' && (<CrudDto>op.value).op === 'add'
                        && op.saveOnApi), 'value'
                    )
                );
                return results;
            }, { add: [], remove: [] });

            for (const action of actions.remove) {
                this.smartobjects = _.reject(this.smartobjects, { uuid: action.value });
            }

            // all list
            const dataLists = this._data.filter((d) => Array.isArray(d.value));
            for (const dataList of dataLists) {
                for (const action of actions.add) {
                    // add data[]
                    if (dataList.type === `so:${action.value.modelKey}`) {
                        dataList.value.push(action.value.uuid);
                        this.changed.next(dataList);
                    }
                }
                // rm
                for (const action of actions.remove) {
                    // reject data[]
                    const arrayReject = _.reject(dataList.value, (d) => d === action.value);
                    if (arrayReject.length !== dataList.value.length) {
                        dataList.value = arrayReject;
                        this.changed.next(dataList);
                    }
                }
            }
        }


        this.changed.next(null);
    }

    private createInputs(appModel: ApplicationModelDto, snPage: SnPageDto, readonly: boolean, inputs: PairDto[], item: PageData): Observable<PairDto[]> {
        const pair$ = inputs.map((input) => {
            return new Observable((observer) => {
                observer.next(); // important to pipe during the call
            }).pipe(
                mergeMap(() =>
                    this.injector.get(PageCustomService).calculateValue(
                        input.key,
                        input.value,
                        false,
                        item,
                        { appModel, snPage, readonly, item },
                        true)
                ),
                map((value: any) => {
                    // pass uuid for smartobject
                    let _value = value;
                    if (Array.isArray(_value)) {
                        _value = _value.length > 0 && _value[0] instanceof SmartObjectDto ? _.map(_value, 'uuid') : _value;
                    } else {
                        _value = _value instanceof SmartObjectDto ? _value.uuid : _value;
                    }
                    let smartobject = null;

                    // affect source
                    if (Array.isArray(_value)) {
                        if (input.key === 'smart-objects-selected' && _value.length > 0) {
                            smartobject = this.smartobjects.find((so) => so.uuid === _value[0]);
                        }
                    } else {
                        if (input.key === 'smart-object-selected') {
                            smartobject = this.smartobjects.find((so) => so.uuid === _value);
                        }
                    }
                    if (smartobject) {
                        this.workflowLauncher.setAdditional('smart-object', smartobject);
                        this.workflowLauncher.setAdditional('smart-model', this.soUtils.getModel(smartobject.modelKey));
                    }

                    return {
                        key: input.key,
                        value: _value,
                    };
                })
            );
        });

        return pair$.length === 0 ? of([]) : zip(...pair$);
    }

    /** public for test */
    _pushData(data: PageData, options: EventOptions) {
        if (options.cumul) {
            const find: PageData = _.find(this._data, { key: data.key });
            if (find && Array.isArray(find.value)) {
                find.value = [
                    ...find.value,
                    ...data.value
                ];
                if (options.notify) {
                    this.changed.next(find);
                }
                return;
            }
        }
        _.remove(this._data, { key: data.key }); // todo unique with inputs
        this._data.push(data);
        if (options.notify) {
            this.changed.next(data);
        }
    }

    private executePage(appModel: ApplicationModelDto, snPage: SnPageDto, ev: SnPageEventPipeDto, readonly: boolean, item: PageData) {
        return this.createInputs(appModel, snPage, readonly, ev.inputs, item).pipe(
            mergeMap((result: PairDto[]) => {
                result = _.uniqBy([...result, ...this.workflowLauncher.computeParameters()], 'key');

                let inputs = window.btoa(encodeURIComponent(JSON.stringify(result)));
                inputs = encodeURIComponent(inputs);
                history.pushState({}, '', window.location.href);
                if (snPage.id !== ev.action) {
                    this.unload.next(snPage.id);
                }
                const appKey = ev.type === 'page' ? appModel.key : ev.action;
                const appPage = ev.type === 'page' ? ev.action : ev.custom?.page;
                const url = appPage ? `/app/${appKey}/${appPage}` : `/app/${appKey}`
                return from(this.router.navigate([url, { inputs }], { replaceUrl: true }));
            })
        );
    }

    /** public for test */
    _executeRefresh(appModel: ApplicationModelDto, snPage: SnPageDto, event: SnPageEventPipeDto) {
        return new Observable((observer) => {
            const widget = this.pageUtils.getWidgets(appModel.snApp).find((w) => w.id === event.action);
            if (!widget) {
                observer.next();
                return ;
            }
            this.unloadDataSources(this.pageUtils.getDataSourcesFromWidget(snPage, widget), widget);
            this.changed.next(null);
            observer.next();
        });
    }

}
