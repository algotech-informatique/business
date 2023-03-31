import { Injectable, Injector, Type } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as Tasks from './index-tasks';
import { WorkflowInstanceDto } from '@algotech-ce/core';
import { TaskService } from './task-service.interface';
import { InterpretorTaskDto, InterpretorValidateDto,
    InterpretorJumpDto } from '../../../../../interpretor/src/dto';
import { DataService } from '@algotech-ce/angular';

@Injectable({
    providedIn: 'root'
})
export class TaskCustomService {

    constructor(
        private injector: Injector,
        private dataService: DataService
    ) { }

    execute(task: InterpretorTaskDto, instance: WorkflowInstanceDto): Observable<InterpretorValidateDto |
        InterpretorJumpDto | null> {

        const taskService = this.createTaskService(task);
        if (taskService) {
            const service: TaskService = this.injector.get(taskService);
            return service.execute(task, instance);
        } else {
            return of(null);
        }
    }

    private createTaskService(task: InterpretorTaskDto): Type<any> {
        return (Tasks as any)[`${task.type}Service`];
    }
}
