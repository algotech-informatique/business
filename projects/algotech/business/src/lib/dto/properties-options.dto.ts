export class PropertiesOptionsDto {
    model: string;
    properties: {
        key: string,
        conditions: string[],
        conditionMode?: 'enabled' | 'visible';
        conditionOperator?: 'and' | 'or';
        value: any,
    };
}
