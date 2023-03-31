import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { SmartObjectDto } from '@algotech-ce/core';

export class TaskObjectDownloadDto {
    @IsDefined()
    objects: CustomResolver<SmartObjectDto[]>;

    @IsOptional()
    first: CustomResolver<Boolean>;
}


