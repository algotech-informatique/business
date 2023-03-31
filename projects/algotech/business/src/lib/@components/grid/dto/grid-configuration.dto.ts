import { PairDto } from '@algotech-ce/core';
import { GridColumnConfigurationDto } from './grid-column-configuration.dto';
import { GridSelectionDto } from './grid-selection.dto';
export class GridConfigurationDto {
    id: string;
    search: boolean;
    reorder: boolean;
    columns: GridColumnConfigurationDto[];
    selection?: GridSelectionDto;
    headerEditable: boolean;
    rowHeight: number;
    colSelectable?: boolean;
    icons?: PairDto[];
    hasActions?: boolean;
    gridWidth?: number;
};
