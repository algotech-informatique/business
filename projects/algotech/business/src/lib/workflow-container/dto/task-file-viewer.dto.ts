import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SysFile } from '@algotech/core';
import { SmartObjectDto } from '@algotech/core';

export class TaskFileViewerDto {
    @IsOptional()
    title: CustomResolver<string>;
    @IsDefined()
    files: CustomResolver<SysFile | SmartObjectDto | Array<SmartObjectDto|SysFile>>;
    @IsDefined()
    fileNameVisible: CustomResolver<boolean>;
    @IsDefined()
    activateAnnotation: CustomResolver<boolean>;
}
