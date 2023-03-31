import { IsDefined, IsUUID, ValidateNested } from 'class-validator';
import { ATSignatureDto } from '@algotech-ce/core';
import { Type } from 'class-transformer';

// @dynamic
export class WorkflowTaskActionSignDto {
    @IsDefined()
    signature: string;

    @IsDefined()
    signatureName: string;

    @IsDefined()
    signatureType: string;

    @IsUUID()
    smartObject: string;

    @ValidateNested()
    @Type(() => ATSignatureDto)
    info: ATSignatureDto;
}
