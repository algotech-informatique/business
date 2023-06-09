import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SysFile } from '@algotech-ce/core';
import { SmartObjectDto } from '@algotech-ce/core';

export class TaskDocumentSelectDto {
    @IsOptional()
    title: CustomResolver<string>;
    @IsDefined()
    documents: CustomResolver<SysFile | SmartObjectDto | Array<SmartObjectDto|SysFile>>;
    @IsDefined()
    search: CustomResolver<boolean>;
    @IsOptional()
    multiple: CustomResolver<boolean>;
}
