import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SmartObjectDto } from '@algotech/core';
import { SysFile } from '@algotech/core';

export class TaskUploadDto {
    @IsOptional()
    title?: CustomResolver<string>;

    @IsDefined()
    multiple: CustomResolver<boolean>;

    @IsDefined()
    documents: CustomResolver<SmartObjectDto>;

    @IsOptional()
    version: CustomResolver<SysFile>;

    @IsOptional()
    activeTag?: CustomResolver<boolean>;

    @IsOptional()
    activeMetadata?: CustomResolver<boolean>;

    @IsOptional()
    modelsTag?: CustomResolver<string[]>;
}
