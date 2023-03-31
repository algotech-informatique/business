import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { SmartFlowUtils } from '../../../../interpretor/src/@utils/smartflow-utils';
import { WorkflowInstanceContextDto, SmartObjectDto, WorkflowLaunchOptionsDto } from '@algotech-ce/core';
import { SmartFlowsService, DatabaseService } from '@algotech-ce/angular';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ATHttpException } from '../../../../interpretor/src';

@Injectable()
export class SmartFlowUtilsService extends SmartFlowUtils {

    constructor(
        private smartflowService: SmartFlowsService,
        private databaseService: DatabaseService,
    ) {
        super();
    }

    start(launchOptions: WorkflowLaunchOptionsDto, context: WorkflowInstanceContextDto): Observable<SmartObjectDto|SmartObjectDto[]> {
        return this.smartflowService.start(launchOptions).pipe(
            catchError((e) => {
                return throwError(new ATHttpException(launchOptions.key, e.status, e.error, e.statusText));
            })
        )
    }

    dbRequest(connection: any, request: string): Observable<any> {
        return this.databaseService.databaseRequest(connection, request);
    }

}
