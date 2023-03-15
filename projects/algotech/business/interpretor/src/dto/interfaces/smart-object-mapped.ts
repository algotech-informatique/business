import { SmartObjectDto } from '@algotech/core';

export interface SmartObjectMapped {
    smartobjects: SmartObjectDto[]
    objects: any[],
    uuid: string;
}