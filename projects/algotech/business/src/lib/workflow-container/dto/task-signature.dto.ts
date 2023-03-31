import { IsDefined } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SmartObjectDto } from '@algotech-ce/core';

export class TaskSignatureDto {
    @IsDefined()
    objectLinked: CustomResolver<SmartObjectDto>;
}
