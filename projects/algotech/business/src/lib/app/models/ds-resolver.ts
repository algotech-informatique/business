import { ApplicationModelDto, SnPageDto, SnPageWidgetDto, SysQueryDto } from '@algotech-ce/core';
import { PageData } from './page-data';

export interface DSResolver {
    appModel: ApplicationModelDto;
    snPage: SnPageDto;
    widget?: SnPageWidgetDto;
    readonly: boolean;
    item: PageData;
    searchParameters?: SysQueryDto;
};
