import { Observable } from 'rxjs';
import { SmartObjectDto, DocumentDto, LangDto, WorkflowInstanceContextDto } from '@algotech/core';

export abstract class InterpretorAbstract {

    constructor() {
    }

    abstract setAsset(asset: any): Observable<any>;
    abstract getSmartObject(context: WorkflowInstanceContextDto, uuid: string): Observable<SmartObjectDto>;
    abstract getSubDoc(context: WorkflowInstanceContextDto, data: { uuid?:string|string[], smartObjects?: SmartObjectDto[] },
        deeped: boolean, excludeRoot: boolean): Observable<SmartObjectDto[]>;
    abstract getDocuments(context: WorkflowInstanceContextDto, uuids: string[]): Observable<DocumentDto[]>;
    abstract transform(values: LangDto[], lang: string): string;
}
