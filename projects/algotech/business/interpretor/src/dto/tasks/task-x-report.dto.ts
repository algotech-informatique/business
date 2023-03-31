import { IsDefined, IsOptional } from 'class-validator';
import { SmartObjectDto, SysFile } from '@algotech-ce/core';
import { CustomResolver } from '../custom-resolver.type';

export class TaskXReportDto {
    @IsDefined()
    object: CustomResolver<SmartObjectDto>;

    @IsDefined()
    fileId: CustomResolver<string>;

    @IsDefined()
    templateName: CustomResolver<string>;

    @IsDefined()
    inputs: CustomResolver<any[]>;

    @IsDefined()
    keysTypes: CustomResolver<any[]>;

    @IsDefined()
    report: CustomResolver<string>;

    @IsOptional()
    version: CustomResolver<SysFile>;

    @IsOptional()
    fileName: CustomResolver<string>;

    @IsDefined()
    generate: CustomResolver<boolean>;

    @IsDefined()
    download: CustomResolver<boolean>;
}
