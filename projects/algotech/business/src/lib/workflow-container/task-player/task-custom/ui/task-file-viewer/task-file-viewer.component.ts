import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { zip, of } from 'rxjs';
import { TaskFileViewerError } from '../../../../container-error/container-error';
import * as _ from 'lodash';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { TaskFileViewerDto } from '../../../../dto/task-file-viewer.dto';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { FileAssetDto } from '../../../../../dto/file-asset.dto';
import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { SysFile } from '@algotech-ce/core';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Component({
    templateUrl: './task-file-viewer.component.html',
    styleUrls: ['./task-file-viewer.style.scss']
})
export class TaskFileViewerComponent implements TaskComponent {

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    fileNameVisible = false;
    files: SysFile[];

    versions: SysFile[];

    consultationAnnotation = false;

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskFileViewerDto;
        zip(
            customData.fileNameVisible(),
            customData.files ? customData.files() : of(null),
            customData.activateAnnotation ? customData.activateAnnotation() : of(false)
        )
            .subscribe((values: any[]) => {

                this.fileNameVisible = values[0];
                const docs = _.isArray(values[1]) ? values[1] : [values[1]];
                this.consultationAnnotation = values[2];

                this.versions = _.compact(this.soUtils.transformListObject(docs, this._task.instance.documents));
                this.onLoad();

            }, (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-081', err, TaskFileViewerError));
            });
    }

    constructor(
        private soUtils: SoUtilsService,
        private filesService: FilesService,
        private taskUtils: TaskUtilsService) {
    }

    onLoad() {
        // transfer not required
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: [],
        };
        this.partialValidate.emit({ validation, authorizationToNext: true });
    }

    downloadDocument(versionID: string) {
        this.filesService.getAsset(versionID).subscribe((asset: FileAssetDto) => {
            const sysFile = _.find(this.versions, (version: SysFile) => version.versionID === versionID);
            if (!sysFile) {
                this.handleError.emit(new TaskFileViewerError('ERR-082', `{{FILE-NOT-FOUND}} ${versionID}`));
            }

            const obsDownload = !asset ? this.filesService.downloadDocument(sysFile, false) : of(asset);
            obsDownload.subscribe((asset: FileAssetDto) => {
                if (asset.file) {
                    this.filesService.openDocument(asset.file, asset.infoFile.name);
                }
            });
        });
    }
}
