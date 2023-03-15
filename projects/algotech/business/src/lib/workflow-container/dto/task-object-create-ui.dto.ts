import { IsString, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';

// @dynamic
export class TaskObjectCreateUIDto {
    @IsOptional()
    skills: CustomResolver<string>;

    @IsOptional()
    title: CustomResolver<string>;
}
