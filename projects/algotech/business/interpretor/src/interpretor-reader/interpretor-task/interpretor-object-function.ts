import * as _ from 'lodash';

export class InterpretorObjectFunction {

    static functions() {
        const _returnProp = (propPathArray: any[]) => {
            return (propPathArray.length > 1) ? propPathArray : propPathArray[0]
        }
        return {
            'at': (object: any, propPathArray: any[]) => {
                return _.at(object, _returnProp(propPathArray));
            },
            'defaults': (object: any, sources: any[]) => {
                return _.defaults(object, sources);
            },
            'defaultsDeep': (object: any, sources: any[]) => {
                return _.defaultsDeep(object, sources);
            },
            'keys': (object: any) => {
                return _.keys(object);
            },
            'invert': (object: any) => {
                return _.invert(object);
            },
            'invertBy': (object: any) => {
                return _.invertBy(object);
            },
            'has': (object: any, compare: string) => {
                return _.has(object, compare);
            },
            'hasIn': (object: any, compare: string) => {
                return _.hasIn(object, compare);
            },
            'set': (object: any, compare: any[], value: any ) => {
                return _.set(object, compare, value);
            },
            'unset': (object: any, compare: any[]) => {
                return _.unset(object, compare);
            },
            
            'omit': (object: any, propPath: any) => {
                return _.omit(object, propPath);
            },
            'findKey': (object: any, propPath: any) => {
                return _.findKey(object, propPath);
            },
            'findLastKey': (object: any, propPath: any) => {
                return _.findLastKey(object, propPath);
            },
            'get': (object: any, propPathArray: any[], value: any) => {
                const prop: any  = _returnProp(propPathArray);
                if (value) {
                    return _.get(object, prop, value);
                } else {
                    return _.get(object, prop);
                }
            },
            'merge': (object: any, sources: any[]) => {
                return _.merge(object, sources);
            },
            'pick': (object: any, propPath: any[]) => {
                return _.pick(object, propPath);
            },
            'result': (object: any, propPathArray: any[], value: any) => {
                const prop: any = _returnProp(propPathArray);
                if (value) {
                    return _.result(object, prop, value);
                } else {
                    return _.result(object, prop);
                }
            }
        };
    }
}
