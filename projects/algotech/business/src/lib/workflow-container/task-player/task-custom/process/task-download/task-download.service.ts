import { TaskService } from '../../task-service.interface';
import { Observable, zip, of } from 'rxjs';
import { WorkflowInstanceDto, SysFile } from '@algotech/core';
import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { TaskDownloadDto } from '../../../../dto/task-download.dto';
import { map, catchError, tap, mergeMap } from 'rxjs/operators';
import { SmartObjectsService } from '@algotech/angular';
import { TaskDownloadError } from '../../../../container-error/container-error';
import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { FileAssetDto } from '../../../../../dto/file-asset.dto';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Injectable()
export class TaskDownloadService implements TaskService {

    constructor(private smartObjectsService: SmartObjectsService, 
        private filesService: FilesService,
        private taskUtils: TaskUtilsService) {
    }
    execute(task: InterpretorTaskDto, instance: WorkflowInstanceDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskDownloadDto);
        return zip(
            customData.file(),
            customData.openFile(),
            customData.synchronous ? customData.synchronous() : of(false),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-088', err, TaskDownloadError);                
            }),
            mergeMap((values: any[]) => {
                const file: SysFile = values[0];
                const openFile: boolean = values[1];
                const synchronous: boolean = values[2];

                if (!synchronous || openFile) {
                    if (file) {
                        this.smartObjectsService.downloadFile(file.versionID, true, !openFile);
                    }
                    return of({});
                }
                return this.filesService.downloadDocument(file, false, true).pipe(
                    tap((asset: FileAssetDto) => {
                        this.filesService.openDocument(asset.file, asset.infoFile.name);
                    })
                );
            }),
            map(() => {
                return {
                    transitionKey: 'done',
                    transfers: [],
                };
            })
        );
    }
}
