import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { PairDto, SmartModelDto, SysFile } from '@algotech-ce/core';

export class TaskCsvMappedDto {

    @IsDefined()
    file: CustomResolver<SysFile>;

    @IsOptional()
    delimiter: CustomResolver<string>;

    @IsDefined()
    smartModel: CustomResolver<SmartModelDto>;

    @IsOptional()
    saveOnApi: CustomResolver<boolean>;

    @IsOptional()
    columns: CustomResolver<PairDto[]>;

    @IsOptional()
    dateFormat: CustomResolver<PairDto[]>;

    @IsOptional()
    encoding: CustomResolver<string>;
}
