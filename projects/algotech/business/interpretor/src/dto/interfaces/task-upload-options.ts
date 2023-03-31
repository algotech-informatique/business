import { SmartObjectDto, SysFile } from '@algotech-ce/core';
import { InterpretorTaskDto } from '../interpretor.task.dto';

export interface TaskUploadOptions {
    object: SmartObjectDto,
    save: boolean,
    fileName: string,
    ext: string,
    version: SysFile,
    task: InterpretorTaskDto,
};