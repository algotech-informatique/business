import { zip, Observable, of } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';
import { SmartObjectDto, ReportGenerateDto, ReportPreviewDto, SysFile } from '@algotech-ce/core';
import * as _ from 'lodash';
import moment from 'moment';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, InterpretorTransferTransitionDto, TaskReportDto } from '../dto';
import { TaskReportCreateError } from '../error/tasks-error';


export class TaskReport extends TaskBase {

    so: SmartObjectDto;
    data: any[];
    reportModel: string;
    fileName: string;
    generate: boolean;
    download: boolean;
    version: SysFile;

    dataValidate: InterpretorValidateDto;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskReportDto);
        return zip(
            customData.object ? customData.object() : of(null),
            customData.data(),
            customData.report ? customData.report() : of(''),
            customData.fileName ? customData.fileName() : of(''),
            customData.generate ? customData.generate() : of(false),
            customData.download ? customData.download() : of(false),
            customData.version ? customData.version() : of(null),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-025', err, TaskReportCreateError);
            }),
            flatMap((values: any[]) => {
                this.so = values[0];
                this.data = values[1];
                this.reportModel = values[2];
                this.fileName = values[3];
                this.generate = values[4];
                this.download = values[5];
                this.version = values[6];
                return this.traitementReport(task);
            })
        );
    }

    traitementReport(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        if (this.generate) {
            const reportGenerate: ReportGenerateDto =
                this.reportsUtils.generateDataReport(
                    this.version, this.reportModel, this.so, this.fileName, this.download, this.data, task.instance.context.user);
            return this.returnTransitionGenerate(task, reportGenerate);
        } else {
            const reportPreview: ReportPreviewDto =
                this.reportsUtils.previewDataReport(this.reportModel, this.fileName, this.download, this.data);
            return this.returnTransitionPreview(task, reportPreview);
        }
    }

    returnTransitionGenerate(task: InterpretorTaskDto, reportGenerate: ReportGenerateDto):
        Observable<InterpretorValidateDto> {

        const obsFiles: Observable<InterpretorTransferTransitionDto>[] = [];

        const versionID = reportGenerate.details ? reportGenerate.details.versionID : '';
        const documentID = reportGenerate.details ? reportGenerate.details.documentID : '';

        const dateUpdated = moment().format();

        const re = /(?:\.([^.]+))?$/;
        const ext = re.exec(reportGenerate.fileName)[1] ? re.exec(reportGenerate.fileName)[1] : '';

        const fileInfo: SysFile = {
            dateUpdated,
            ext: ext,
            name: reportGenerate.fileName,
            documentID: documentID,
            versionID: versionID,
            reason: this.version ? this.version.reason : '',
            size: 0,
            user: `${task.instance.context.user.firstName} ${task.instance.context.user.lastName}`,
            tags: this.version ? this.version.tags : [],
            metadatas: [],
        };

        obsFiles.push(of(this._createDataTransfer(task, fileInfo)));
        obsFiles.push(of(this._createActionDataTransfer(reportGenerate, 'reportGenerate')));
        return zip(...obsFiles).pipe(
            map((resultFiles) =>
                this._computevalidation(_.compact(resultFiles)))
        );
    }

    returnTransitionPreview(task: InterpretorTaskDto, reportPreview: ReportPreviewDto):
        Observable<InterpretorValidateDto> {
        return this.reportsUtils.previewReport(reportPreview, task.instance.smartobjects, task.instance.context).pipe(
            map(() => {
                return this._computevalidation([]);
            })
        );
    }

    _createActionDataTransfer(reportGenerate: ReportGenerateDto | ReportPreviewDto, reportAction: string) {

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: reportAction,
                value: reportGenerate
            }
        };
        return transfer;
    }

    _createDataTransfer(task: InterpretorTaskDto, fileInfo: SysFile) {

        const data = this._getTransitionData(task);
        if (!data) {
            return null;
        }

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            data,
            type: 'sysobjects',
            value: fileInfo,
        };

        return transfer;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            return null;
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }

    _computevalidation(transferData): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: transferData
        };
        return validation;
    }
}
