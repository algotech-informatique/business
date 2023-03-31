import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { PairDto, SmartObjectDto } from '@algotech-ce/core';

export class TaskServiceDto {

    @IsDefined()
    url: CustomResolver<string>;

    @IsOptional()
    parameters: CustomResolver<PairDto[]>;

    @IsOptional()
    headers: CustomResolver<PairDto[]>;

    @IsOptional()
    body: CustomResolver<PairDto[]>;

    @IsDefined()
    type: CustomResolver<string>;

    @IsOptional()
    listSysFile: CustomResolver<string[]>;

    @IsOptional()
    responseType: CustomResolver<string>;

    @IsOptional()
    fileName: CustomResolver<string>;

    @IsOptional()
    generate: CustomResolver<boolean>;

    @IsOptional()
    object: CustomResolver<SmartObjectDto>;

    @IsOptional()
    version: CustomResolver<boolean>;

    @IsOptional()
    multiVariable: CustomResolver<boolean>;

    @IsOptional()
    jsonObject: CustomResolver<object>;

    @IsOptional()
    returnHeaders: CustomResolver<boolean>;
}
