import { IsString, IsDefined, IsBoolean, IsOptional } from 'class-validator';
import { SmartObjectDto } from '@algotech/core';
import { InterpretorTaskActionAssetDto } from './interpretor-task-action-asset.dto';

// @dynamic
export class InterpretorTransferTransitionDto {
    @IsDefined()
    data?: {
        key: string;
        type: string;
    };

    @IsBoolean()
    @IsDefined()
    saveOnApi: boolean;

    @IsBoolean()
    @IsOptional()
    ignoreOperations?: boolean;

    @IsBoolean()
    @IsOptional()
    requireInstance?: boolean;

    @IsString()
    @IsDefined()
    type: 'smartobjects'  | 'sysobjects' | 'action';

    @IsDefined()
    value: SmartObjectDto | Object |  InterpretorTaskActionAssetDto;
}
