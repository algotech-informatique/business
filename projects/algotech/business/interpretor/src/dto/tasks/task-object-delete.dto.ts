import { IsDefined } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { SmartObjectDto } from '@algotech-ce/core';

export class TaskObjectDeleteDto {
    @IsDefined()
    objects: CustomResolver<SmartObjectDto[]>;
}
