import { SmartObjectDto, SmartPropertyObjectDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import moment, { ISO_8601 } from 'moment';
import { InterpretorCondition } from './interpretor-condition';

export class InterpretorArrayFunction {
    static functions(smartobjects: SmartObjectDto[]) {
        const _predicateEqual = (element: any, propValue: any, propKey: string) => {
            const value = propValue instanceof SmartObjectDto ? propValue.uuid : propValue;
            let compare = element instanceof SmartObjectDto ?
                element.properties.find((p) => p.key === propKey)?.value : element[propKey];

            if (value?.criteria) {
                if (moment(value.value, ISO_8601).isValid()) {
                    compare = moment(compare).format();
                }
                return InterpretorCondition.validate(compare, [value]);
            } else if (moment(value, ISO_8601).isValid()) {
                compare = moment(compare).format();
            }

            return _.isEqual(value, compare);
        };
    
        const toJSON = (smartobject: SmartObjectDto): any => {
            if (!(smartobject instanceof SmartObjectDto)) {
                return smartobject;
            }
    
            const _smartobject = _.cloneDeep(smartobject);
            _.forEach(_smartobject.properties, (property: SmartPropertyObjectDto) => {
    
                if (Array.isArray(property.value)) {
                    _smartobject[property.key] = _.map(property.value, (item) => {
                        return toJSONValue(smartobjects, item);
                    });
                } else {
                    _smartobject[property.key] = toJSONValue(smartobjects, property.value);
                }
            });
    
            return _smartobject;
        }
    
        const toJSONValue = (smartobjects: SmartObjectDto[], value: any) => {
            const findSo = _.find(smartobjects, so => so.uuid === value);
            if (findSo) {
                return findSo;
            } else {
                return value;
            }
        };

        return {
            'concat': (array: any[], inspect: any[]) => {
                return _.concat(array, inspect);
            },
            'difference': (array: any[], inspect: any[]) => {
                if (array.length > 0 && array[0] instanceof SmartObjectDto &&
                    inspect && inspect.length > 0 && inspect[0] instanceof SmartObjectDto) {

                    return _.map(
                        _.difference(_.map(array, 'uuid'), _.map(inspect, 'uuid')), (uuid: string) => {
                            return _.find([...array, ...inspect], { uuid });
                        });
                }
                // pure difference
                if (array.length > 0 && _.isObject(array[0]) && inspect && inspect.length > 0 && _.isObject(inspect[0])) {
                    return array.filter((item) => {
                        return !inspect.some((compare) => JSON.stringify(item) === JSON.stringify(compare));
                    })
                }
                return _.difference(array, inspect);
            },
            'every': (array: any[], propKey: string, propValue: any) => {
                return _.every(array, (item) => _predicateEqual(item, propValue, propKey));
            },
            'find': (array: any[], propKey: string, propValue: any) => {
                return _.find(array, (item) => _predicateEqual(item, propValue, propKey));
            },
            'filter': (array: any[], propKey: string, propValue: any) => {
                return _.filter(array, (item) => _predicateEqual(item, propValue, propKey));
            },
            'item': (array: any[], position: number) => {
                if (array.length <= position) {
                    throw new Error('index out of bounds');
                }
                return array[position];
            },
            'join': (array: any[], separator: string) => {
                return _.join(array, separator ? separator : '\n');
            },
            'left': (array: any[], position: number) => {
                return _.take(array, position);
            },
            'length': (array: any[]) => {
                return array.length;
            },
            'map': (array: any[], propKey: string) => {
                if (!propKey) {
                    return array;
                }
                return _.map(array, (item) => {
                    return toJSON(item)[propKey];
                });
            },
            'orderBy': (array: any[], propKey: string, order: string) => {
                const newOrder = (order && (
                    order.toUpperCase().trim().startsWith('DESC')) || order.trim() === '-1') ? 'desc': 'asc';
                const jsonOrder = _.orderBy(
                    _.map(array, (item) => toJSON(item)),
                    propKey,
                    newOrder
                );
                if (array.length > 0 && array[0] instanceof SmartObjectDto) {
                    return _.map(jsonOrder, (item) => _.find(array, { uuid: item.uuid }));
                }
                return jsonOrder;
            },
            'reject': (array: any[], propKey: string, propValue: any) => {
                return _.reject(array, (item) => _predicateEqual(item, propValue, propKey));
            },
            'reverse': (array: any[]) => {
                return _.reverse(array);
            },
            'right': (array: any[], position: number) => {
                return _.takeRight(array, position);
            },
            'slice': (array: any[], start: number, end: number) => {
                return _.slice(array, start, end);
            },
            'some': (array: any[], propKey: string, propValue: any) => {
                return _.some(array, (item) => _predicateEqual(item, propValue, propKey));
            },
            'sort': (array: any[]) => {
                return array.sort();
            },
            'uniq': (array: any[]) => {
                return _.uniq(array);
            },
            'uniqBy': (array: any[], propKey: string) => {
                const uniqOrder = _.uniqBy(
                    _.map(array, (item) => toJSON(item)),
                    propKey
                );
                if (array.length > 0 && array[0] instanceof SmartObjectDto) {
                    return _.map(uniqOrder, (item) => _.find(array, { uuid: item.uuid }));
                }
                return uniqOrder;
            },
        };
    }
}
