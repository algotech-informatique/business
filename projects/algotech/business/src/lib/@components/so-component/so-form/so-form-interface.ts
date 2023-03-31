import { LangDto, SmartPropertyModelDto } from '@algotech-ce/core';

export interface ISoFormBreadCrumb {
    uuid?: string;
    caption: string;
    data: ISoFormComponent;
    scroll?: number;
}

export interface ISoFormComponent {
    component: 'object' | 'mutliple';
    componentProps: any;
}

export interface ISoFormProperty {
    model: SmartPropertyModelDto;
    value: any;
    disabled: boolean;
    showed: boolean;
}

export interface ISoFormAction {
    key: string;
    icon: string;
    color: string;
    caption: string;
    component?: any;
}
