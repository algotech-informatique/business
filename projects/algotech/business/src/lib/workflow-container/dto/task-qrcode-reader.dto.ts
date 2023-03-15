import { IsDefined } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';

export class TaskQRCodeReaderDto {

    @IsDefined()
    title: CustomResolver<string>;

    @IsDefined()
    timeoutSeconds: CustomResolver<number>;
}
