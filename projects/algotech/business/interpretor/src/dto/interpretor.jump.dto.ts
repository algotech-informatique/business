import { IsDefined, IsOptional } from 'class-validator';
import { InterpretorTypeJump } from './interpretor-type-move.enum';

// @dynamic
export class InterpretorJumpDto {
    @IsDefined()
    direction: InterpretorTypeJump;

    @IsOptional()
    options?: {
        force?:  boolean;
        reverse?: boolean;
    };

    @IsOptional()
    uuid?: string;
}
