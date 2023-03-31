import { Injectable } from '@angular/core';
import { InterpretorAbstract } from '../../../../interpretor/src/interpretor-abstract/interpretor-abstract';
import { FilesService } from '../../workflow-interpretor/@utils/files.service';
import { SmartObjectDto, LangDto, WorkflowInstanceContextDto, PairDto } from '@algotech-ce/core';
import { DocumentsService, SmartObjectsService, TranslateLangDtoService } from '@algotech-ce/angular';
import { defer, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WorkflowMetricsService } from '../workflow-metrics/workflow-metrics.service';
import { InterpretorMetricsKeys } from '../../../../interpretor/src';

@Injectable()
export class WorkflowAbstractService extends InterpretorAbstract {

    constructor(
        private translateLang: TranslateLangDtoService,
        private documentsService: DocumentsService,
        private smartObjectsService: SmartObjectsService,
        private filesService: FilesService,
        private workflowMetrics: WorkflowMetricsService) {
        super();
    }

    setAsset(asset: any) {
        return this.filesService.setAsset(asset);
    }

    getSmartObject(context: WorkflowInstanceContextDto, uuid: string): Observable<SmartObjectDto> {
        return defer(() => {
            this.workflowMetrics.start(context?.metrics, InterpretorMetricsKeys.InterpretorDBRequest);
            return this.smartObjectsService.get(uuid).pipe(
                tap(() => this.workflowMetrics.stop(context?.metrics, InterpretorMetricsKeys.InterpretorDBRequest)
                ));
        }) as Observable<SmartObjectDto>;
    }

    getSubDoc(context: WorkflowInstanceContextDto, data: { uuid?:string|string[], smartObjects?: SmartObjectDto[] },
        deeped: boolean, excludeRoot: boolean) {
        return defer(() => {
            this.workflowMetrics.start(context?.metrics, InterpretorMetricsKeys.InterpretorDBRequest);

            const payload = data.uuid ? data.uuid : data.smartObjects.map((so) => so.uuid);
            const params: PairDto[] =  [
                { key: 'deep', value: deeped ? '1' : '0' },
                { key: 'excludeRoot', value: excludeRoot ? '1' : '0' }
            ]

            return this.smartObjectsService.getSubDoc(payload, params).pipe(
                tap(() => this.workflowMetrics.stop(context?.metrics, InterpretorMetricsKeys.InterpretorDBRequest))
            );
        });
    }

    getDocuments(context: WorkflowInstanceContextDto, uuids: string[]) {
        return defer(() => {
            this.workflowMetrics.start(context?.metrics, InterpretorMetricsKeys.InterpretorDBRequest);
            return this.documentsService.getByUuids(uuids).pipe(
                tap(() => this.workflowMetrics.stop(context?.metrics, InterpretorMetricsKeys.InterpretorDBRequest)
                )
            );
        });
    }

    transform(values: LangDto[], lang?: string): string {
        return this.translateLang.transform(values, lang);
    }
}
