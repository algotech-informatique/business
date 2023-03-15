import { PairDto, SearchSOFilterDto } from '@algotech/core'
import { GridColumnConfigurationDto } from './grid-column-configuration.dto';

export class GridStorageDto {
    columns: GridColumnConfigurationDto[];
    filter?: SearchSOFilterDto[];
    order?: PairDto[];
};
