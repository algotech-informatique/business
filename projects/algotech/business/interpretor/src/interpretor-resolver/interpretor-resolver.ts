import {
    SmartObjectDto, SmartModelDto,
    SmartPropertyObjectDto,
    GenericListDto,
    GenericListValueDto,
    typesSys,
    WorkflowInstanceContextDto,
} from '@algotech/core';
import { Observable, throwError, of, zip, defer } from 'rxjs';
import { map, tap, mergeMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import {
    WorkflowErrorSmartModelNotFind,
    WorkflowErrorPropertyNotFind,
    WorkflowErrorTodo,
    WorkflowErrorCustomNotValid,
    WorkflowErrorSysModelNotFind,
    WorkflowErrorSmartObjectNotFind,
} from '../error/interpretor-error';
import moment from 'moment';
import { InterpretorAbstract } from '../interpretor-abstract/interpretor-abstract';
import { InterpretorSoUtils } from '../interpretor-reader/interpretor-so/interpretor-so-utils';
import { CustomResolverParams } from '../dto';


export class InterpretorResolver {

    constructor(private interpretorAbstract: InterpretorAbstract) {
    }

    KEYWORD_SMARTMODEL = 'smartmodel';

    public searchKeywords(keywords: string, text: string) {
        return keywords.split(' ').every((keyword) => text.toUpperCase().includes(keyword.toUpperCase()));
    }

    public skipAndLimit(params: CustomResolverParams, list: any[]): any[] {
        let findSkip = null;
        let findLimit = null;
        let findSearch = null;
        // skip & limit
        findSkip = params?.searchParameters?.skip;
        findLimit = params?.searchParameters?.limit;
        findSearch = params?.searchParameters?.search;
        if (!findSkip && !findLimit && !findSearch) {
            return list;
        }
        let skip = findSkip ? findSkip : 0;
        let limit = findLimit ? findLimit : list.length;

        let _list = list;
        if (findSearch && findSearch) {

            _list = _.filter(_list, (data: SmartObjectDto | any) => {
                if (_.isString(data)) {
                    return this.searchKeywords(findSearch, data);
                }
                if (!(data instanceof SmartObjectDto)) {
                    return true; // todo
                }

                return _.find(data.properties, (property: SmartPropertyObjectDto) => {
                    const values: any[] = _.isArray(property.value) ? property.value : [property.value];
                    for (const value of values) {
                        if (value && _.isString(value) && this.searchKeywords(findSearch, value)) {
                            return true;
                        }
                    }
                    return false;
                }) !== undefined;
            });
        }

        skip = Math.max(skip, 0);
        skip = Math.min(skip, _list.length);
        limit = Math.max(limit, 0);
        limit = Math.min(limit, _list.length);

        skip = skip * limit;
        limit = skip + limit;

        _list = _list.slice(skip, limit);
        return _list;
    }

    /** public for test */
    _getSymboles(value: any): string[] {
        if (typeof value === 'string') {
            const res = value.match(/{{(?!\[)(.*?)}}/ig);
            if (res) {
                return res;
            }
        }
        return [];
    }

    /** public for test */
    _getType(type: any): 'sys' | 'so' | any {
        if (type.key) {
            return 'glist';
        } else if (type.startsWith('so:')) {
            return 'so';
        } else if (type.startsWith('sys:')) {
            return 'sys';
        } else {
            return type;
        }
    }

    /** public for test */
    _isFormula(value: any): boolean {
        const symboles = this._getSymboles(value);
        return symboles.length > 0 && (symboles.length > 1 || !(value.startsWith('{{') && value.endsWith('}}')));
    }

    /** public for test */
    _browseSysObject(sysObject: any, type: string, split: string[], lang: string, params?: CustomResolverParams, context?: WorkflowInstanceContextDto): any {
        const splitClone: string[] = [...split];
        const sysModel = typesSys.find((t) => t.type === type);

        if (!sysModel) {
            throw new WorkflowErrorSysModelNotFind('ERR-109', `{{NOT-FOUND}}: ${type}`);
        }

        const propValue = sysObject[splitClone[0]];
        let propType = sysModel.schema[splitClone[0]];
        propType = Array.isArray(propType) && propType.length > 0 ? propType[0] : propType;
        if (!propType) {
            throw new WorkflowErrorPropertyNotFind('ERR-111', `{{NOT-FOUND}}: ${splitClone[0]}`);
        }

        const data$ = this._calculateData(propValue, propType, [], lang, params, context);
        splitClone.shift();

        return data$.pipe(
            map((data: any) => {
                if (splitClone.length === 0) {
                    return data;
                } else {
                    throw new WorkflowErrorTodo('ERR-102', `{{SUB-TYPE-SYS}} {{NOT-YET-IMPEMENTED}}`);
                }
            })
        );
    }

    /** public for test */
    _browseObject(object: any, split: string[]): Observable<any> {
        const splitClone: string[] = [...split];
        const propValue = object[splitClone[0]];

        if (propValue === undefined) {
            return throwError(new WorkflowErrorSysModelNotFind('ERR-110', `{{CANT-BROWSE-OBJECT}} : ${splitClone[0]}`));
        }
        splitClone.shift();

        if (splitClone.length === 0) {
            return of(propValue);
        } else {
            return this._browseObject(propValue, splitClone);
        }
    }

    /** public for test */
    _browseSmartObject(smartModels: SmartModelDto[], gLists: GenericListDto[],
        smartObject: SmartObjectDto | SmartObjectDto[], smartObjects: SmartObjectDto[],
        split: string[], lang: string, params?: CustomResolverParams, context?: WorkflowInstanceContextDto): Observable<any> {

        const splitClone: string[] = [...split];
        let data$;

        if (Array.isArray(smartObject)) {
            data$ = splitClone.length === 0 ? of(null) : of(smartObject[+splitClone[0]]);
            splitClone.shift();
        } else {
            const smartModel = smartModels.find((sm) => sm.key.toUpperCase() === smartObject.modelKey.toUpperCase());

            if (!smartModel) {
                throw new WorkflowErrorSmartModelNotFind('ERR-107', `: ${smartObject.modelKey}`);
            }

            const propInstance = smartObject.properties.find((p) => p.key.toUpperCase() === splitClone[0].toUpperCase());
            const propModel = smartModel.properties.find((p) => p.key.toUpperCase() === splitClone[0].toUpperCase());

            if (!propModel) {
                throw new WorkflowErrorPropertyNotFind('ERR-112', `{{NOT-FOUND}}: ${splitClone[0]}`);
            }
            splitClone.shift();

            const glist = propModel.items ? _.find(gLists, (g: GenericListDto) => g.key === propModel.items) : null;
            data$ = this._calculateData(propInstance ? propInstance.value : null, glist ? glist : propModel.keyType, smartObjects,
                lang, params, context);
        }


        return data$.pipe(
            mergeMap((data: any) => {
                if (splitClone.length === 0) {
                    return of(data);
                } else {
                    if (!data) {
                        return of(null);
                    }
                    return this._browseSmartObject(smartModels, gLists, data, smartObjects, splitClone, lang, params, context);
                }
            })
        );
    }

    /** public for test */
    _calculateData(value: any, type: any, smartObjects: SmartObjectDto[], lang: string, params?: CustomResolverParams,
        context?: WorkflowInstanceContextDto): Observable<any> {

        return defer(() => {
            let async = false;
            const isArray = _.isArray(value);
            const formatted = params?.formatted;
            const byValue = params?.byValue;
            const shortType = this._getType(type);

            const values = _.map(isArray ? value : [value], (data: any, index: number) => {
                switch (shortType) {
                    case 'glist': {
                        const glist: GenericListDto = type;
                        if (!glist || !glist.values) {
                            return data;
                        }
                        const findValue: GenericListValueDto = _.find(glist.values, (v: GenericListValueDto) => v.key === data);
                        if (!findValue || !findValue.value || (formatted && !byValue)) {
                            return data;
                        }
                        return _.isString(findValue.value) ? findValue.value : this.interpretorAbstract.transform(findValue.value, lang);
                    }
                    case 'so': {
                        // so
                        if (data) {
                            const findSo = InterpretorSoUtils.quickFind(smartObjects, context?.custom?.indexes, data);
                            if (!findSo) {
                                async = true;
                                return this.interpretorAbstract.getSmartObject(context, data).pipe(
                                    catchError(() => {
                                        if (params?.nullIfError) {
                                            return of(null);
                                        } else {
                                            return throwError(new WorkflowErrorSmartObjectNotFind('ERR-106', `{{NOT-FOUND}}: ${data}`));
                                        }
                                    }),
                                    map((result: SmartObjectDto) => {
                                        const so = InterpretorSoUtils.pushSo(smartObjects, context?.custom?.indexes, result);
                                        values[index] = so;
                                        return so;
                                    })
                                );
                            }
                            if (findSo instanceof SmartObjectDto) {
                                return findSo;
                            }
                            return InterpretorSoUtils.smartObjectToClass(findSo);
                        }
                        return null;
                    }
                    case 'sys': {
                        if (type === 'sys:comment' && data && !formatted) {
                            return data.message;
                        }
                        return data;
                    }
                    case 'datetime': {
                        if (!data) {
                            return null;
                        }
                        if (formatted) {
                            return moment(data).format();
                        }
                        return new Date(data).toLocaleString(lang);
                    }
                    case 'date': {
                        if (!data) {
                            return null;
                        }
                        if (formatted) {
                            return moment(data).startOf('day').format();
                        }
                        return new Date(data).toLocaleDateString(lang);
                    }
                    case 'time': {
                        if (!data || formatted) {
                            return data;
                        }
                        return moment(value, 'HH:mm:ss').format('LT');
                    }
                    case 'string': {
                        return data ? data : '';
                    }
                    default:
                        return data;
                }
            });

            const resolve$: Observable<any>[] = async ? values.filter((v) => v instanceof Observable) : [];
            return (resolve$.length === 0 ?
                of([]) :
                zip(...resolve$)
            ).pipe(
                map(() => {
                    if (isArray) {
                        if (values) {
                            return values.filter(value => value != null);
                        }
                    } else {
                        if (values && values.length === 1 && values[0] !== null) {
                            return values[0];
                        }
                    }
                })
            )
        })
    }

    /** public for test */
    _calculateValueModel(smartmodels: SmartModelDto[], propName: string, propValue: any): Observable<any> {
        // model
        if (propName.toLowerCase() !== this.KEYWORD_SMARTMODEL) {
            return null;
        }

        const smartModel = _.find(smartmodels, (sm: SmartModelDto) => sm.key === propValue);
        if (!smartModel) {
            return throwError(new WorkflowErrorSmartModelNotFind('ERR-108', `{{PROPERTY}} {{NOT-FOUND}}: ${propValue}`));
        }
        return of(smartModel);
    }

    _calculateValueComplex(propValue: any, calculateValue: (value: any) => Observable<any>): Observable<any> {
        const resolve = (element, pointer, index): Observable<any> => {
            if (this._getSymboles(element).length > 0) {
                return calculateValue(element).pipe(
                    tap((res) => {
                        if (Array.isArray(pointer) && Array.isArray(res)) {
                            pointer.push(...res);
                        } else {
                            pointer[index] = res;
                        }
                    })
                );
            }
            return null;
        }

        const all$: Observable<any>[] = [];
        const browse = (element): any => {
            if (Array.isArray(element)) {
                const array = [];

                element.forEach((item, index) => {
                    const resolve$ = resolve(item, array, index);
                    if (resolve$) {
                        all$.push(resolve$);
                    } else {
                        const res = browse(item);
                        if (Array.isArray(res)) {
                            array.push(...res);
                        } else {
                            array[index] = res;
                        }
                    }
                }, []);

                return array;
            }
            if (_.isObject(element)) {
                const object = {}

                Object.entries<any>(element).forEach(([key, value]) => {
                    const resolve$ = resolve(value, object, key);
                    if (resolve$) {
                        all$.push(resolve$);
                    } else {
                        object[key] = browse(value);
                    }
                }, []);

                return object;
            }

            return element;
        }

        const res = browse(propValue);
        if (all$.length === 0) {
            return of(res);
        }
        return zip(...all$).pipe(
            map(() => res)
        );
    }

    /** public for test */
    _calculateValueObject(propValue: any, params: CustomResolverParams,
        calculateValue: (value: any) => Observable<any>): Observable<any> {
        // object
        if (!propValue || typeof (propValue) !== 'object') {
            return null;
        }

        if (params?.notInspectObject) {
            return of(propValue);
        }

        return defer(() => {
            return this._calculateValueComplex(propValue, calculateValue);
        });
    }

    /** public for test */
    _calculateValueArray(propName: string, propValue: any, params: CustomResolverParams,
        calculateValue: (value: any) => Observable<any>,
        applySkipLimit: boolean): Observable<any> {
        // array
        if (!_.isArray(propValue)) {
            return null;
        }

        if (params?.notInspectObject) {
            return of(propValue);
        }

        return defer(() => {
            return this._calculateValueComplex(propValue, calculateValue).pipe(
                map((res: any[]) => {
                    if (!applySkipLimit) {
                        return _.concat(...res);
                    }
                    return this.skipAndLimit(params, _.concat(...res));
                }),
            );
        });
    }

    /** public for test */
    _calculateValueBrowse(split: string[], data$: Observable<any>, type: string, smartobjects: SmartObjectDto[],
        smartmodels: SmartModelDto[], glists: GenericListDto[], lang: string, params: CustomResolverParams, context?: WorkflowInstanceContextDto) {
        // browse object
        split.shift();
        if (split.length > 0) {
            return data$.pipe(
                mergeMap(
                    (object: any) => {
                        switch (this._getType(type)) {
                            case 'so':
                                return this._browseSmartObject(smartmodels, glists,
                                    object, smartobjects, split, lang, params, context);
                            case 'object':
                            case 'sys':
                                return this._browseObject(object, split);
                            default:
                                return throwError(new WorkflowErrorCustomNotValid('ERR-117', `{{NOT-VALID}} : ${type} {{IS-NOT-OBJECT}}`));
                        }
                    })
            );
        }

        return data$;
    }

    /** public for test */
    _calculateFormula(formula: string, forExpression,
        calculateValue: (v) => Observable<any>): Observable<string | { formula: string, values: any[] }> {
        if (!this._isFormula(formula)) {
            return null;
        }
        let res = formula;

        const symboles = this._getSymboles(formula);
        const obsCalculateExpr: Observable<any>[] = [];

        for (const symbole of symboles) {
            obsCalculateExpr.push(
                calculateValue(symbole)
            );
        }
        return (obsCalculateExpr.length === 0 ? of([]) : zip(...obsCalculateExpr))
            .pipe(
                map(
                    (values: any[]) => {
                        for (let i = 0; i < symboles.length; i++) {
                            let value = values[i];
                            if (forExpression && typeof (values[i]) === 'string') {
                                value = `"${values[i].replace(/"/g, '”')}"`;
                            } else if (forExpression && typeof (values[i]) === 'boolean') {
                                value = values[i] ? 'TRUE' : 'FALSE';
                            }
                            res = res.replace(symboles[i], value);
                        }
                        return forExpression ? { formula: res, values } : res;
                    }
                ),
            );
    }
}
