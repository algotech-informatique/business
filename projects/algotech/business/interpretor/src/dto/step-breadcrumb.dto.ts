import { IsDefined, ValidateNested, IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { LangDto } from '@algotech-ce/core';
import { Type } from 'class-transformer';

// @dynamic
export class BreadCrumbDto {
    @IsUUID()
    @IsOptional()
    stackUUID?: string;

    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => LangDto)
    displayName: LangDto[];

    @IsArray()
    @IsOptional()
    profil: string;

    @IsBoolean()
    @IsDefined()
    active: boolean;
}
