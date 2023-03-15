import { WorkflowInstanceContextDto, SmartObjectDto, WorkflowLaunchOptionsDto } from '@algotech/core';
import { Observable } from 'rxjs';

export abstract class SmartFlowUtils {

    constructor() { }

    abstract start(launchOptions: WorkflowLaunchOptionsDto, context: WorkflowInstanceContextDto):
        Observable<SmartObjectDto|SmartObjectDto[]>;

    abstract dbRequest(connection: any, request: string): Observable<any>;
}
