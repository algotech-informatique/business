import { IsString, IsDefined, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InterpretorTransferTransitionDto } from './interpretor-transfer-transition.dto';

// @dynamic
export class InterpretorValidateDto {
    @IsString()
    @IsDefined()
    transitionKey: string;

    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => InterpretorTransferTransitionDto)
    transfers: InterpretorTransferTransitionDto[];
}
