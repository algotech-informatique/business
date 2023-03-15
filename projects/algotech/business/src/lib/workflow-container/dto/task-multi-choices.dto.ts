import { IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';

export class TasKMultiChoices {
    @IsOptional()
    title: CustomResolver<string>;
    @IsOptional()
    description: CustomResolver<string>;
}
