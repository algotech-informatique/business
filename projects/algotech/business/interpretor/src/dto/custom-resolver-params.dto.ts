import { SysQueryDto } from '@algotech/core';

export class CustomResolverParams {
    formatted?: boolean;
    ignoreClone?: boolean;
    byValue?: boolean;
    notInspectObject?: boolean;
    searchParameters?: SysQueryDto;
    nullIfError?: boolean;
}