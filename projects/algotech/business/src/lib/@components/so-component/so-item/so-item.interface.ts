import { SmartObjectDto } from '@algotech-ce/core';

export interface ISoItemObject {
    data: SmartObjectDto;
    prop1: string;
    prop2?: string;
    prop3?: string;
    icon: string;
    deletable?: boolean;
    checked?: boolean;
    disable?: boolean;
}
