import * as _ from 'lodash';

interface Criteria {
    criteria: string;
    value: any;
    secondValue: any;
}

export class InterpretorCondition {
    static validate(value: any, criterias: Criteria[]) {
        return criterias.every(criteria => {
            switch (criteria.criteria) {
                case 'startsWith':
                    return value.startsWith(criteria.value);
                case 'notStartsWith':
                    return !value.startsWith(criteria.value);
                case 'endWith':
                    return value.endsWith(criteria.value);
                case 'contains':
                    return value.includes(criteria.value);
                case 'gt':
                    return value > criteria.value;
                case 'lt':
                    return value < criteria.value;
                case 'gte':
                    return value >= criteria.value;
                case 'lte':
                    return value <= criteria.value;
                case 'between':
                    const min = criteria.value < criteria.secondValue ? criteria.value : criteria.secondValue;
                    const max = criteria.value > criteria.secondValue ? criteria.value : criteria.secondValue;
                    return min <= value && value <= max;
                case 'equals':
                    return _.isEqual(value, criteria.value);
                case 'different':
                    return !_.isEqual(value, criteria.value);
                case 'isNull':
                    return value == null || value.length === 0;
                case 'isNotNull':
                    return (value != null) && (!Array.isArray(value) || value?.length > 0);        
                case 'exists':
                    return (value != null) && (!Array.isArray(value) || value?.length > 0);
                case 'in':
                    const checkArray = Array.isArray(value) ? value : [value];
                    return checkArray.some((value: any) => criteria.value.includes(value));
                default:
                    return false;
            }
        });
    }
}
