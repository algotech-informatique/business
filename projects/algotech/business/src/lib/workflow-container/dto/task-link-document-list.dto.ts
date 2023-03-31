import { SmartObjectDto } from '@algotech-ce/core';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { IsDefined, IsOptional } from 'class-validator';
export class TaskDocumentLinkDto {
    @IsDefined()
    title: CustomResolver<string>;
    @IsDefined()
    items: CustomResolver<SmartObjectDto[] | SmartObjectDto>;
    @IsOptional()
    multipleSelection: CustomResolver<boolean>;
    @IsOptional()
    cart: CustomResolver<boolean>;
    @IsOptional()
    search: CustomResolver<boolean>;
}
