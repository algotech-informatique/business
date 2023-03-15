import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';

export class TaskInputCaptureDto {

    @IsDefined()
    title: CustomResolver<string>;

    @IsOptional()
    entryField: CustomResolver<string>;

    @IsOptional()
    buttonText: CustomResolver<string>;
}
