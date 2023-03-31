import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SysFile } from '@algotech-ce/core';

export class TaskDownloadDto {
    @IsDefined()
    file: CustomResolver<SysFile>;

    @IsDefined()
    openFile: CustomResolver<boolean>;

    @IsOptional()
    synchronous?: CustomResolver<boolean>;
}
