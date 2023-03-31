import { SysQueryDto } from '@algotech-ce/core';

export class CustomResolverParams {
    formatted?: boolean;
    ignoreClone?: boolean;
    byValue?: boolean;
    notInspectObject?: boolean;
    searchParameters?: SysQueryDto;
    nullIfError?: boolean;
}