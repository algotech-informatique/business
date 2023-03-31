import {
    ServiceModelDto, TaskModelDto,
    WorkflowExpressionDto,
    WorkflowInstanceDto,
    LangDto,
    WorkflowModelDto,
    GenericListDto,
} from '@algotech-ce/core';
import { Observable, throwError, of, zip, defer } from 'rxjs';
import { map, tap, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { CustomResolverParams, InterpretorMetricsKeys } from '../../dto';
import {
    WorkflowErrorDataNotFind,
    WorkflowErrorTodo,
    WorkflowErrorExpression
} from '../../error/interpretor-error';
import { InterpretorService } from './interpretor-service';
import { InterpretorProfiles } from '../interpretor-profiles/interpretor-profiles';
import * as formulaParserNs from 'hot-formula-parser';
import { InterpretorAbstract } from '../../interpretor-abstract/interpretor-abstract';
import { InterpretorArrayFunction } from './interpretor-array-function';
import { InterpretorObjectFunction } from './interpretor-object-function';
import { InterpretorResolver } from '../../interpretor-resolver/interpretor-resolver';
import { InterpretorFormulaParser } from './Interpretor-formula-parser';
import { InterpretorSoUtils } from '../interpretor-so/interpretor-so-utils';
import { InterpretorUtils } from '../../interpretor-utils/interpretor-utils';
import { InterpretorMetrics } from '../../interpretor-metrics/interpretor-metrics';

const formulaParser = formulaParserNs;

export class InterpretorTask extends InterpretorResolver {

    KEYWORD_PROFILES = 'profiles';
    DEBUG = false;

    constructor(
        protected workflowUtils: InterpretorUtils,
        protected workflowService: InterpretorService,
        protected workflowProfiles: InterpretorProfiles,
        protected workflowAbstract: InterpretorAbstract,
        protected workflowMetrics: InterpretorMetrics,) {
        super(workflowAbstract);
    }

    public calculateCustom(instance: WorkflowInstanceDto, task: TaskModelDto): any {

        const custom = {};

        for (const prop in task.properties.custom) {
            if (task.properties.custom.hasOwnProperty(prop)) {
                if (task.properties.custom[prop] != null) {
                    custom[prop] = (params?: CustomResolverParams) => {
                        return defer(() => {
                            this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolver);
                            return this._calculateValue(instance, prop, task.properties.custom[prop], task.properties.services,
                                task.properties.expressions, params).pipe(
                                    tap((res) => this.workflowUtils.pushStackData(instance, `${task.uuid}.${prop}`, res)),
                                    map((res) => this._clone(res, params)), // important clone data to avoid updating during reading the task
                                    tap(() => this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolver)));
                        });
                    }
                }
            }
        }

        return custom;
    }

    public calculateValue(instance: WorkflowInstanceDto, value: any, task: TaskModelDto, params: CustomResolverParams) {
        return this._calculateValue(instance, '', value, task.properties.services, task.properties.expressions, params).pipe(
            map((res) => _.cloneDeep(res)) // important clone data to avoid updating during reading the task
        );
    }

    public browsePath(instance: WorkflowInstanceDto, path: string) {
        return this._calculateValue(instance, '', `{{${path}}}`, [], [], {});
    }

    /** public for test */
    _clone(value, params?: CustomResolverParams) {
        if (params?.ignoreClone) {
            return value;
        }
        if (!InterpretorSoUtils.isSmartObject(value)) {
            return _.cloneDeep(value);
        }

        return InterpretorSoUtils.smartObjectToClass(value, true);
    }

    /** public for test */
    _executeService(instance: WorkflowInstanceDto, service: ServiceModelDto, services: ServiceModelDto[],
        expressions: WorkflowExpressionDto[], params: CustomResolverParams):
        Observable<any> {

        const obsParams: Observable<any>[] = [];
        for (const param of service.params) {
            obsParams.push(
                this._calculateValue(instance, '', param.value, services, expressions, { formatted: true })
            );
        }

        switch (service.api) {
            case 'algotech':
                return this.workflowService.execute(obsParams, service, instance.smartobjects, params,
                    this.workflowUtils.isReadonly(instance), instance.context);
            default:
                return throwError(new WorkflowErrorTodo('ERR-101', `{{NOT-YET-IMPEMENTED}}`));
        }
    }

    /** public for test */
    _executeObjectFunction(instance: WorkflowInstanceDto, expression: WorkflowExpressionDto, services: ServiceModelDto[],
        expressions: WorkflowExpressionDto[], params: CustomResolverParams) {
        const inputs$: Observable<any>[] = [
            this._calculateValue(instance, '', expression.value.array, services, expressions, params, true),
            ...(_.map(expression.value.parameters, (p) => {

                return this._calculateValue(instance, '', p.value, services, expressions, params, true);
            }))
        ];
        return zip(...inputs$).pipe(
            map((res) => {
                let fResult = null;
                try {
                    fResult = _.invoke(InterpretorObjectFunction.functions(), expression.value.function, ...res);
                } catch (e) {
                    new WorkflowErrorExpression('ERR-114', `{{CALCULATION-ERROR}}: ${expression.value.function}: ${e.message}`);
                    return null;
                }
                return fResult;
            })
        );
    }

    /** public for test */
    _executeArrayFunction(instance: WorkflowInstanceDto, expression: WorkflowExpressionDto, services: ServiceModelDto[],
        expressions: WorkflowExpressionDto[], params: CustomResolverParams) {
        const inputs$: Observable<any>[] = [
            this._calculateValue(instance, '', expression.value.array, services, expressions, params, true),
            ...(_.map(expression.value.parameters, (p) => {

                return this._calculateValue(instance, '', p.value, services, expressions, params, true);
            }))
        ];
        return zip(...inputs$).pipe(
            map((res) => {
                const functions = InterpretorArrayFunction.functions(instance.smartobjects);
                let fResult = null;
                try {
                    fResult = _.invoke(functions, expression.value.function, ...res);
                } catch (e) {
                    throw new WorkflowErrorExpression('ERR-115', `{{CALCULATION-ERROR}}: ${expression.value.function}: ${e.message}`);
                }
                return fResult;
            })
        );
    }

    _executeGListValues(instance: WorkflowInstanceDto, expression: WorkflowExpressionDto, services: ServiceModelDto[],
        expressions: WorkflowExpressionDto[], params: CustomResolverParams, lang: string) {
        const key$: Observable<string> = this._calculateValue(instance, '', expression.value.key, services, expressions, params, true);

        return key$.pipe(
            map((key: string) => {
                const selectedListe: GenericListDto = instance.context.glists.find((gl: GenericListDto) => gl.key === key);
                return (!selectedListe) ? [] :
                    selectedListe.values.map((data) => {
                        return {
                            key: data.key,
                            value: this.workflowAbstract.transform(data.value, lang),
                            index: data.index,
                        }
                    });
            }),
        );
    }

    /** public for test */
    _executeExpression(instance: WorkflowInstanceDto, expression: WorkflowExpressionDto, services: ServiceModelDto[],
        expressions: WorkflowExpressionDto[], lang: string, params: CustomResolverParams):
        Observable<any> {
        return defer(() => {
            let type = null;
            if (expression && expression.value && expression.value.type) {
                type = expression.value.type;
            } else {
                type = (_.isArray(expression.value) ? 'TextFormatting' : 'Formula');
            }
            switch (type) {
                case 'GListValues':
                    return this._executeGListValues(instance, expression, services, expressions, params, lang);
                case 'ArrayFunction':
                    return this._executeArrayFunction(instance, expression, services, expressions, params);
                case 'ObjectFunction':
                    return this._executeObjectFunction(instance, expression, services, expressions, params);
                case 'TextFormatting': {
                    return this._calculateValue(instance, '', expression.value, services, expressions, {}, true).pipe(
                        map((value: string | LangDto[]) => {
                            const res = this.workflowAbstract.transform(value as LangDto[], lang);
                            return res?.toString ? res.toString() : res;
                        })
                    );
                }
                case 'Formula':
                    return this._calculateValue(instance, '', expression.value, services, expressions,
                        { formatted: true }, true).pipe(
                            mergeMap((res: string | { formula: string, values: any[] }) => {
                                let result;
                                const customParser = new InterpretorFormulaParser();
                                const formula = typeof (res) === 'string' ? res : res.formula;
                                const values = typeof (res) === 'string' ? [] : res.values;
                                if (customParser.tryParseFormula(formula, values)) {
                                    result = customParser.executeFormula();
                                } else {
                                    const FormulaParser = formulaParser.Parser;
                                    const parser = new FormulaParser();
                                    result = parser.parse(formula);
                                }

                                if (result.error) {
                                    return throwError(new WorkflowErrorExpression('ERR-116', `{{CALCULATION-ERROR}}: ${result.error}`));
                                }

                                return this._calculateData(result.result, expression.type, instance.smartobjects, lang, params, instance.context);
                            })
                        );
            }
        });
    }

    /** public for test */
    _isService(propValue: string, services: ServiceModelDto[]): boolean {
        if (services.find((s) => `{{${s.key}}}` === propValue || s.key === propValue)) {
            return true;
        }
        return false;
    }

    /** public for test */
    _isExpression(propValue: string, expressions: WorkflowExpressionDto[]): boolean {
        if (expressions.find((e) => `{{${e.key}}}` === propValue || e.key === propValue)) {
            return true;
        }
        return false;
    }

    /** public for test */
    _calculateValue(instance: WorkflowInstanceDto, propName: string, propValue: any,
        services: ServiceModelDto[], expressions: WorkflowExpressionDto[], params: CustomResolverParams,
        forExpression = false): Observable<any> {

        // parameter
        const parameter = this._calculateValueParameter(instance.workflowModel, propValue);
        if (parameter) {
            return parameter;
        }

        // formula
        const formula = this._calculateFormula(propValue, forExpression,
            ((v: any) => this._calculateValue(instance, propName, v, services, expressions, params)));
        if (formula) {
            return formula;
        }

        // model
        const model = this._calculateValueModel(instance.context?.smartmodels, propName, propValue);
        if (model) {
            return model;
        }

        // profiles
        const profiles = this._calculateValueProfiles(instance, propName, propValue);
        if (profiles) {
            return profiles;
        }

        // array
        let hasService = false;
        if (Array.isArray(propValue) && propValue.length > 0 && _.isString(propValue[0])) {
            hasService = _.some(propValue, (v) => this._isService(v, services));
        }
        const array = this._calculateValueArray(propName, propValue, params,
            (v) => this._calculateValue(instance, propName, v, services, expressions, params),
            !forExpression && !hasService);

        if (array) {
            return defer(() => {
                !this.DEBUG ? null : this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolverArray)
                return array.pipe(
                    tap(() => !this.DEBUG ? null : this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolverArray))
                )
            });
        }

        // object
        const object = this._calculateValueObject(propValue, params,
            (v) => this._calculateValue(instance, propName, v, services, expressions, params));
        if (object) {
            return defer(() => {
                !this.DEBUG ? null : this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolverObject)
                return object.pipe(
                    tap(() => !this.DEBUG ? null : this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolverObject))
                )
            });
        }

        // not symbole
        const symboles = this._getSymboles(propValue);
        if (symboles.length === 0) {
            return of(propValue);
        }

        return this._calculateValueSymboles(instance, symboles, services, expressions, params);
    }

    /** public for test */
    _calculateValueParameter(workflow: WorkflowModelDto, propValue: any) {
        // parameter
        if (!workflow.parameters) {
            return null;
        }
        const findParameter = workflow.parameters.find((p) => `{{${p.key}}}` === propValue);
        if (findParameter) {
            return of(findParameter.value);
        }
        return null;
    }

    /** public for test */
    _calculateValueProfiles(instance: WorkflowInstanceDto, propName: string, propValue: any) {
        // profiles
        if (!propName.toLocaleLowerCase().startsWith(this.KEYWORD_PROFILES)) {
            return null;
        }

        return of(this.workflowProfiles.transform(instance, propValue));
    }

    /** public for test */
    _calculateValueSymboles(instance: WorkflowInstanceDto, symboles: string[], services: ServiceModelDto[],
        expressions: WorkflowExpressionDto[], params: CustomResolverParams) {

        // symbole
        const symbole = symboles[0].slice(2, symboles[0].length - 2);
        const split = InterpretorSoUtils.split(symbole);

        const input = split[0];
        let type = '';
        let obsData: Observable<any> = null;
        if (split.length > 0) {
            if (this._isService(input, services)) {
                obsData = defer(() => {
                    // service
                    const service = services.find((s) => s.key === input);
                    type = service.return.type;

                    this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorDBRequest);
                    return this._executeService(instance, service, services, expressions, params).pipe(
                        tap((value: any) => {
                            if (InterpretorSoUtils.isSmartObject(value)) {
                                InterpretorSoUtils.pushSoIfNotExists(instance.smartobjects, value, instance.context?.custom?.indexes);
                            }
                            this.workflowUtils.pushStackData(instance, service.uuid, value);
                            // Disposable
                            if (params) {
                                Object.keys(params).forEach(key => params[key] = undefined);
                            }
                        })
                    ).pipe(
                        tap(() => this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorDBRequest))
                    )
                });
            } else if (this._isExpression(input, expressions)) {
                obsData = defer(() => {
                    // expression

                    const expression = expressions.find((e) => e.key === input);
                    !this.DEBUG ? null : this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolverExpression);
                    return this._executeExpression(instance, expression, services, expressions, instance.context.user.preferedLang,
                        params).pipe(
                            tap((value: any) => {
                                this.workflowUtils.pushStackData(instance, expression.key, value);
                                !this.DEBUG ? null : this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolverExpression);
                            }
                            ))
                });

            } else {
                // data
                const findData = instance.data.find((d) => d.key === input);

                if (!findData) {
                    return throwError(new WorkflowErrorDataNotFind('ERR-113', `{{NOT-FOUND}}: ${input}`));
                }
                type = findData.type;
                obsData = defer(() => {
                    !this.DEBUG ? null : this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolverData);
                    return this._calculateData(findData.value, type, instance.smartobjects, instance.context.user.preferedLang,
                        params, instance.context).pipe(
                            tap(() => !this.DEBUG ? null : this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorCustomResolverData))
                        )
                });
            }
        }

        return this._calculateValueBrowse(split, obsData, type,
            instance.smartobjects, instance.context.smartmodels, instance.context.glists,
            instance.context.user.preferedLang,
            params, instance.context);
    }
}
