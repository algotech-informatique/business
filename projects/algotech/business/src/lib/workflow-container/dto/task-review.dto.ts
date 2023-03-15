import { IsDefined } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SysFile, NotificationDto } from '@algotech/core';

export class TaskReviewDto {
    @IsDefined()
    notification: CustomResolver<NotificationDto>;

    @IsDefined()
    comment: CustomResolver<Boolean>;

    @IsDefined()
    linkedFiles: CustomResolver<SysFile | SysFile[]>;
}
