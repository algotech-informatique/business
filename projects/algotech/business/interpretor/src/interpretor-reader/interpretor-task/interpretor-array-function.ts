import { SmartObjectDto, SmartPropertyObjectDto } from '@algotech-ce/core';
import * as _ from 'lodash';

export class InterpretorArrayFunction {
    static functions(smartobjects: SmartObjectDto[]) {
        const _predicateEqual = (element: any, propValue: any, propKey: string, smartobjects: SmartObjectDto[]) => {
            const value = propValue instanceof SmartObjectDto ? propValue.uuid : propValue;
            if (element instanceof SmartObjectDto) {
                return _.isEqual(value, element.properties.find((p) => p.key === propKey)?.value);
            } else {
                return _.isEqual(value, element[propKey]);
            }
        };
    
        const toJSON = (smartobject: SmartObjectDto, smartobjects: SmartObjectDto[]): any => {
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
                return _.difference(array, inspect);
            },
            'every': (array: any[], propKey: string, propValue: any) => {
                return _.every(array, (item) => _predicateEqual(item, propValue, propKey, smartobjects));
            },
            'filter': (array: any[], propKey: string, propValue: any) => {
                return _.filter(array, (item) => _predicateEqual(item, propValue, propKey, smartobjects));
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
                    return toJSON(item, smartobjects)[propKey];
                });
            },
            'orderBy': (array: any[], propKey: string, order: string) => {
                const newOrder = (order && (
                    order.toUpperCase().trim().startsWith('DESC')) || order.trim() === '-1') ? 'desc': 'asc';
                const jsonOrder = _.orderBy(
                    _.map(array, (item) => toJSON(item, smartobjects)),
                    propKey,
                    newOrder
                );
                if (array.length > 0 && array[0] instanceof SmartObjectDto) {
                    return _.map(jsonOrder, (item) => _.find(array, { uuid: item.uuid }));
                }
                return jsonOrder;
            },
            'reverse': (array: any[]) => {
                return _.reverse(array);
            },
            'right': (array: any[], position: number) => {
                return _.takeRight(array, position);
            },
            'some': (array: any[], propKey: string, propValue: any) => {
                return _.some(array, (item) => _predicateEqual(item, propValue, propKey, smartobjects));
            },
            'sort': (array: any[]) => {
                return array.sort();
            },
            'uniq': (array: any[]) => {
                return _.uniq(array);
            },
            'uniqBy': (array: any[], propKey: string) => {
                const uniqOrder = _.uniqBy(
                    _.map(array, (item) => toJSON(item, smartobjects)),
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
