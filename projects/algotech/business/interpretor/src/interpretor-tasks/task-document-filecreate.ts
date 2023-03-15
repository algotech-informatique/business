import { Observable, of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { InterpretorValidateDto, InterpretorTaskDto } from '../dto';
import { TaskDocumentFileCreateError } from '../error/tasks-error';
import { TaskBase } from './task-base';
import * as _ from 'lodash';
import { TaskDocumentFileCreateDto } from '../dto/tasks/task-document-filecreate.dto';
import { TaskUploadOptions } from '../dto/interfaces/task-upload-options';

export class TaskDocumentFileCreate extends TaskBase {
    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskDocumentFileCreateDto);
        return zip(
            customData.body(),
            customData.ext(),
            customData.fileName ? customData.fileName() : of(''),
            customData.download ? customData.download() : of(false),
            customData.save ? customData.save() : of(false),
            customData.object ? customData.object() : of(null),
            customData.version ? customData.version() : of(false),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-058', err, TaskDocumentFileCreateError);
            }),
            map((values: any[]) => {
                const body = values[0];
                let ext = values[1].split('.').pop();
                ext = ext ? ext : 'txt';
                const fileName = `${(values[2] ? values[2] : 'file').split('.')[0]}.${ext}`;
                const download = values[3];

                const content = _.isObject(body) ? JSON.stringify(body) : body;
                const file = this.reportsUtils.createTextFile(fileName, content, ext, download);
                const options: TaskUploadOptions = {
                    ext,
                    fileName,
                    save: values[4],
                    object: values[5],
                    version: values[6],
                    task: task,
                }

                return this.taskUtils.computevalidation(this.taskUtils.getUploadTransfers(file as Blob, options));
            }),
        );
    }
}