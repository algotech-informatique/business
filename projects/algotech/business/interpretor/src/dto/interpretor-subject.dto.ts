export class InterpretorSubjectDto {
    action: 'operation' | 'operations' | 'service' | 'validate' | 'jump'| 'execute' | 'debug';
    date: Date;
    success: boolean;
    error?: Error;
    value?: any;
}
