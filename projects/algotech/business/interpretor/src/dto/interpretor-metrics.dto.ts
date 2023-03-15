import { InterpretorMetricsKeys } from './enum';

export class InterpretorMetricsDto {
    time: number;
    items: {
        key: InterpretorMetricsKeys | string;
        execution: number;
        time: number;
        percent: string;
        childs: InterpretorMetricsDto[]
    }[]
}