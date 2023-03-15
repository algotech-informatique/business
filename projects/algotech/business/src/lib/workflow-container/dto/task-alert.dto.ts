import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';

export class TaskAlertDto {

    @IsDefined()
    alertTitle: CustomResolver<string>;

    @IsDefined()
    alertMessage: CustomResolver<string>;

    @IsOptional()
    alertType: CustomResolver<string>;
}
