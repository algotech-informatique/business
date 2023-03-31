import { SmartObjectDto } from '@algotech-ce/core';

export interface SmartObjectMapped {
    smartobjects: SmartObjectDto[]
    objects: any[],
    uuid: string;
}