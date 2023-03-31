import { ApplicationModelDto, SmartObjectDto, SnPageDto, SnPageEventDto, SnPageWidgetConditionDto, SnPageWidgetDto, SnPageWidgetRuleDto } from '@algotech-ce/core';
import { Injectable } from '@angular/core';
import { Observable, of, zip } from 'rxjs';
import * as _ from 'lodash';
import { PageCustomService } from './page-custom.service';
import { PageData } from '../models';
import { map, mergeMap } from 'rxjs/operators';

@Injectable()
export class PageRulesService {
    constructor(private pageCustom: PageCustomService) { }

    recomposeRule
        <
            TA extends { custom: any; css: any; events: SnPageEventDto[] },
            TB extends { custom: any; css: any; events: SnPageEventDto[] }
        >(from: TA, to: TB, difference?: TA) {
        // css: recompose
        for (const name of Object.keys(from.css)) {
            const css = from.css[name];
            if (!to.css[name]) {
                to.css[name] = {};
            }
            if (_.isObject(css)) {
                for (const propKey of Object.keys(css)) {
                    if (!difference || !_.isEqual(difference.css[name]?.[propKey], css[propKey])) {
                        to.css[name][propKey] = _.cloneDeep(css[propKey]);
                    }
                }
            }
        }

        // custom: recompose
        for (const propKey of Object.keys(from.custom)) {
            if (!difference || !_.isEqual(difference.custom[propKey], from.custom[propKey])) {
                to.custom[propKey] = _.cloneDeep(from.custom[propKey]);
            }
        }

        // events: recompose
        for (const fromEv of from.events) {
            const index = to.events.findIndex((ev) => ev.eventKey === fromEv.eventKey);
            if (difference) {
                const find = difference.events.find((ev) => ev.eventKey === fromEv.eventKey);
                if (!_.isEqual(find, fromEv)) {
                    if (index === -1) {
                        to.events.push(_.cloneDeep(fromEv));
                    } else {
                        to.events[index] = _.cloneDeep(fromEv);
                    }
                }
            } else {
                if (index === -1) {
                    to.events.push(_.cloneDeep(fromEv));
                } else {
                    to.events[index] = _.cloneDeep(fromEv);
                }
            }
        }
    }

    applyRules(appModel: ApplicationModelDto, snPage: SnPageDto, readonly: boolean, item: PageData,
        widget: SnPageWidgetDto) {
        if (widget.rules.length > 0) {
            return this.applyRule(appModel, snPage, readonly, item, widget.rules, widget.rules[0], widget);
        }
        return of(_.cloneDeep(widget));
    }

    applyRule(appModel: ApplicationModelDto, snPage: SnPageDto, readonly: boolean, item: PageData,
        rules: SnPageWidgetRuleDto[], rule: SnPageWidgetRuleDto, widget: SnPageWidgetDto) {
        return this.respectConditions(appModel, snPage, readonly, item, rule).pipe(
            mergeMap((respect: boolean) => {
                if (respect) {

                    const result: SnPageWidgetDto = _.cloneDeep(widget)
                    this.recomposeRule(rule, result);
                    return of(result);
                } else {
                    const index = rules.indexOf(rule) + 1;
                    if (index < rules.length) {
                        return this.applyRule(appModel, snPage, readonly, item, rules, rules[index], widget);
                    }
                    return of(_.cloneDeep(widget));
                }
            })
        )
    }

    respectConditions(appModel: ApplicationModelDto, snPage: SnPageDto, readonly: boolean, item: PageData, rule: SnPageWidgetRuleDto):
        Observable<boolean> {

        if (rule.conditions.length === 0) {
            return of(false);
        }
        const values$ = rule.conditions.map((condition) => zip(
            this.pageCustom.calculateValue(
                null,
                condition.input,
                false,
                item,
                { appModel, snPage, readonly, item },
                true,
                false
            ),
            this.pageCustom.calculateValue(
                null,
                condition.value,
                false,
                item,
                { appModel, snPage, readonly, item },
                true,
                false
            )
        ).pipe(
            map((values: string[]) => {
                const result: SnPageWidgetConditionDto = {
                    criteria: condition.criteria,
                    input: values[0],
                    value: values[1],
                }
                return result;
            }))
        );

        return zip(...values$).pipe(
            map((conditions: SnPageWidgetConditionDto[]) => {
                const predicate = (condition: SnPageWidgetConditionDto) => this.respectCondition(condition);
                return rule.operator === 'and' ? conditions.every(predicate) : conditions.some(predicate);
            })
        );
    }

    respectCondition(condition: SnPageWidgetConditionDto) {
        switch (condition.criteria) {
            case 'isNull':
                return condition.input === null || condition.input === undefined || (Array.isArray(condition) && condition.input.length === 0);
            case 'isNotNull':
                return (condition.input !== null && condition.input !== undefined) || (Array.isArray(condition) && condition.input.length !== 0);
            case 'exists':
                return (condition.input !== null && condition.input !== undefined) || (Array.isArray(condition) && condition.input.length > 0);
            case 'isEmptyArray':
                return (condition.input != null) && (Array.isArray(condition.input) && condition.input.length === 0);
            case 'isNotEmptyArray':
                return (condition.input != null) && (Array.isArray(condition.input) && condition.input.length !== 0);
            default:
                break;
        }

        const toStringPredicate = (value: any) => (Array.isArray(value) ? value : [value]).map((v) => v?.toString ? v.toString() : v);
        const inputs = _.flattenDeep(
            (Array.isArray(condition.input) ? condition.input : [condition.input]).map(
                (ele: any) => {
                    if (ele instanceof SmartObjectDto) {
                        return ele.properties.map((prop) => {
                            return toStringPredicate(prop.value);
                        });
                    } else if (_.isObject(ele)) {
                        return Object.keys(ele).map((propKey: string) => {
                            return toStringPredicate(ele[propKey]);
                        });
                    }
                    return ele;
                }
            )
        ).filter((item: any) => item != null);

        return inputs.some((input: any) => {
            switch (condition.criteria) {
                case 'startsWith':
                    return input.startsWith(condition.value);
                case 'notStartsWith':
                    return !input.startsWith(condition.value);
                case 'endWith':
                    return input.endsWith(condition.value);
                case 'contains':
                    return input.includes(condition.value);
                case 'gt':
                    return input > condition.value;
                case 'lt':
                    return input < condition.value;
                case 'gte':
                    return input >= condition.value;
                case 'lte':
                    return input <= condition.value;
                case 'equals':
                    return _.isEqual(input, condition.value);
                case 'different':
                    return !_.isEqual(input, condition.value);
                case 'in':
                    const checkArray = Array.isArray(input) ? input : [input];
                    return checkArray.some((value: any) => condition.value.includes(value));
                default:
                    return false;
            };
        })
    }
}