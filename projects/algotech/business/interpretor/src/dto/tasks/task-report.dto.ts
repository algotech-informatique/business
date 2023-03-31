import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { SmartObjectDto, SysFile } from '@algotech-ce/core';

export class TaskReportDto {
    @IsDefined()
    object: CustomResolver<SmartObjectDto>;

    @IsDefined()
    data: CustomResolver<any[]>;

    @IsDefined()
    report: CustomResolver<string>;

    @IsOptional()
    version: CustomResolver<SysFile>;

    @IsOptional()
    fileName: CustomResolver<string>;

    @IsDefined()
    generate: CustomResolver<Boolean>;

    @IsDefined()
    download: CustomResolver<Boolean>;
}
