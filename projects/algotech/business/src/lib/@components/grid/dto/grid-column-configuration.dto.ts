export class GridColumnConfigurationDto {
    id?: string;
    key: string;
    name: string;
    type: string;
    multiple: boolean;
    width: number;
    sort: boolean;
    filter: boolean;
    resize: boolean;
    hide?: boolean;
    selected?: boolean;
    custom?: any;
    sticky: 'left' | 'right' | 'none';
};
