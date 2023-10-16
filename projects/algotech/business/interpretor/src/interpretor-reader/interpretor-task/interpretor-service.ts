
import { mergeMap, catchError } from 'rxjs/operators';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { ServiceModelDto, PairDto, SmartObjectDto, WorkflowInstanceContextDto, WorkflowLaunchOptionsDto } from '@algotech-ce/core';
import { WorkflowErrorTodo } from '../../error/interpretor-error';
import { ServiceReturnModelDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { InterpretorSoUtils } from '../interpretor-so/interpretor-so-utils';
import { CustomResolverParams } from '../../dto';

export abstract class InterpretorService {

    protected api: string;

    constructor(
    ) {
    }

    abstract call(url: string, headers: PairDto[], body: any, type: 'get'|'patch'|'post'|'put'|'delete'|'update', responseType: 'blob' | 'json'): Observable<any>;

    abstract callATService(route: string, body: object, type: string, typeReturn: ServiceReturnModelDto,
        smartObjects: SmartObjectDto[], context: WorkflowInstanceContextDto): Observable<any>;


    static paramsToPair(params: CustomResolverParams) {
        const paramsToPair: PairDto[] = !params ? [] : _.compact([
            params?.searchParameters?.search ? { key: 'search', value: params.searchParameters.search } : null,
            params?.searchParameters?.skip ? { key: 'skip', value: params.searchParameters.skip } : null,
            params?.searchParameters?.limit ? { key: 'limit', value: params.searchParameters.limit } : null,
        ]);
        return paramsToPair;
    }

    public execute(obsParams: Observable<any>[], service: ServiceModelDto, smartObjects: SmartObjectDto[], params: CustomResolverParams,
        readonly: boolean, context: WorkflowInstanceContextDto): Observable<any> {

        if (service.body) {
            return throwError(new WorkflowErrorTodo('ERR-099', `{{FAILED-TO-RUN-SERVICE}}: {{BODY-DEFAULT-NOT-IMPLEMETED}}`));
        }

        const obs = obsParams.length === 0 ? of([]) : forkJoin(obsParams);
        return obs.pipe(
                mergeMap(
                    (values: any[]) => {
                        if (values.length !== service.params.length) {
                            return throwError(new WorkflowErrorTodo('ERR-100',`{{FAILED-TO-RUN-SERVICE}}: {{SIZE-OF-PARAMS-INCORRECT}}`));
                        }
                        return this.callATService(
                            this._prepareRoute(service, values, params),
                            this._prepareBody(service, values, readonly, params),
                            service.type,
                            service.return,
                            smartObjects,
                            context);
                    }
                ),
                catchError((err) => throwError(err)),
            );
    }

    _prepareRouteDeprecated(service: ServiceModelDto, route: string, params: CustomResolverParams) {
        // use for inject search, skip and limit on header of route
        // deprecated, now use search-parameters
        // keep for deprecated route smart-objects/search

        if (!route.includes('/smart-objects/search')) {
            return route;
        }

        const paramsToPair: PairDto[] = InterpretorService.paramsToPair(params);
        if (paramsToPair && paramsToPair.length > 0) {
            let routeParams = '';
            for (const param of paramsToPair) {
                const findKey = service.mappedParams ? service.mappedParams.find((p) => p.key === param.key) : null;
                const key = findKey ? findKey.value : param.key;

                // if parameter already exists
                const re = new RegExp(`${key}*?=[^&?]*`);
                const value = `${key}=${param.value}`;
                if (re.test(route)) {
                    route = route.replace(re.exec(route)[0], value);
                } else {
                    routeParams = (routeParams === '' && route.indexOf('?') === -1) ?
                        '?' : `${routeParams}&`;
                    routeParams = `${routeParams}${value}`;
                }
            }
            route = `${route}${routeParams}`;
        }

        return route;
    }

    /** public for test */
    _prepareRoute(service: ServiceModelDto, values: any[], params: CustomResolverParams): string {
        let route = service.route.replace('{{SERVER}}', this.api);
        route = this._prepareRouteDeprecated(service, route, params)

        for (let i = 0; i < service.params.length; i++) {
            const paramModel = service.params[i];
            const paramValue = values[i];
            switch (paramModel.type) {
                case 'url-segment': {
                    route = route.replace(`{{${paramModel.key}}}`, paramValue);
                }
                    break;
            }
        }
        
        return route;
    }

    /** public for test */
    _prepareBody(service: ServiceModelDto, values: any[], readonly: boolean, params?: CustomResolverParams): any {
        let body: any = {};
        for (let i = 0; i < service.params.length; i++) {
            const paramModel = service.params[i];
            const paramValue = values[i];
            switch (paramModel.type) {
                case 'request-body': {
                    if (!body) {
                        body = {};
                    }
                    body[paramModel.key] = paramValue;
                }
                    break;
            }
        }
        if (params?.searchParameters) {
            body.searchParameters = params.searchParameters;
        }
        if (body && service.route.includes('startsmartflows')) {
            (body as WorkflowLaunchOptionsDto).readonly = readonly;
        }

        return body;
    }

    public buildQueryRoute(params?: PairDto[]) {
        return params ?
            _.reduce(params, (result, param) => {
                result = result === '' ? '?' : `${result}&`;
                result = `${result}${param.key}=${ encodeURIComponent(param.value) }`;
                return result;
            }, '') : '';
    }

    public mergeSmartObjectWithLocalData(response: any, typeReturn: ServiceReturnModelDto, smartObjects: SmartObjectDto[]) {
        if (!typeReturn.type.startsWith('so:')) {
            return response;
        }
        if (_.isArray(response)) {
            return InterpretorSoUtils.smartObjectToClass(_.reduce(response, (results, smartObject) => {
                const findSo = smartObjects.find((so) => so.uuid === smartObject.uuid);
                if (findSo) {
                    results.push(findSo);
                } else {
                    results.push(smartObject);
                }
                return results;
            }, []));
        } else {
            const findSo = smartObjects.find((so) => so.uuid === response.uuid);
            if (findSo) {
                return InterpretorSoUtils.smartObjectToClass(findSo);
            }
        }
        return InterpretorSoUtils.smartObjectToClass(response);
    }
}
