import { Observable, of, zip } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { InterpretorValidateDto, InterpretorTaskDto, TaskDocumentFileZipDto } from '../dto';
import { TaskDocumentFileZipError } from '../error/tasks-error';
import { TaskBase } from './task-base';
import * as _ from 'lodash';
import { TaskUploadOptions } from '../dto/interfaces/task-upload-options';

export class TaskDocumentFileZip extends TaskBase {
    ext = 'zip';
    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskDocumentFileZipDto);
        return zip(
            customData.documents ? customData.documents() : of([]),
            customData.fileName ? customData.fileName() : of(''),
            customData.download ? customData.download() : of(false),
            customData.save ? customData.save() : of(false),
            customData.object ? customData.object() : of(null),
            customData.version ? customData.version() : of(false),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-057', err, TaskDocumentFileZipError);
            }),
            mergeMap((values: any[]) => {
                const docs = _.isArray(values[0]) ? values[0] : [values[0]];
                const fileName = `${(values[1] ? values[1] : 'archive').split('.')[0]}.${this.ext}`;
                const download = values[2];

                const options: TaskUploadOptions = {
                    ext: this.ext,
                    fileName,
                    save: values[3],
                    object: values[4],
                    version: values[5],
                    task,
                }

                const versions = _.compact(this.soUtils.transformListObject(docs, task.instance.documents));
                return this.reportsUtils.zip(versions, fileName, download, task.instance.context).pipe(
                    map((file: Blob) => {
                        return this.taskUtils.computevalidation(this.taskUtils.getUploadTransfers(file, options));
                    }
                ));
            }),
        );
    }
}