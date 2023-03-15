import { Injectable } from '@angular/core';
import { InterpretorUtils } from '../../../../interpretor/src/interpretor-utils/interpretor-utils';
import { ScheduleUtilsService } from '.././@utils/schedule-utils.service';
import { SkillsUtilsService } from '.././@utils/skills-utils.service';
import { SoUtilsService } from '.././@utils/so-utils.service';
import { SysUtilsService } from '.././@utils/sys-utils.service';
import { ReportsUtilsService } from '.././@utils/reports-utils.service';
import { WorkflowServiceService } from '../workflow-reader/workflow-task/workflow-service.service';
import { SmartFlowUtilsService } from '.././@utils/smartflow-utils.service';
import { TaskUtilsService } from '../@utils/task-utils.service';
import { TaskModelDto } from '@algotech/core';
import { WorkflowSubjectService } from '../workflow-subject/workflow-subject.service';

const TASK_NO_UI = [
    'TaskDownload',
    'TaskAlert',
    'TaskGeolocation',
    'TaskAutoPhoto',
];

const TASK_LAUNCHER = 'TaskLauncher';
const TASK_FINISHER = 'TaskFinisher';

@Injectable()
export class WorkflowUtilsService extends InterpretorUtils {
    constructor(
        protected workflowServiceService: WorkflowServiceService,
        protected workflowSubject: WorkflowSubjectService,
        protected reportUtilsService: ReportsUtilsService,
        protected scheduleUtilsService: ScheduleUtilsService,
        protected skillsUtilsService: SkillsUtilsService,
        protected soUtilsService: SoUtilsService,
        protected sysUtilsService: SysUtilsService,
        protected smartflowUtilsService: SmartFlowUtilsService,
        protected taskUtils: TaskUtilsService,
    ) {
        super(workflowServiceService, reportUtilsService, scheduleUtilsService, skillsUtilsService,
            soUtilsService, sysUtilsService, smartflowUtilsService, taskUtils, workflowSubject);
    }

    public isTaskUI(task: TaskModelDto) {
        if (!super.isTaskUI(task)) {
            return false;
        }
        return ((TASK_NO_UI.indexOf(task.type) === -1) && (task.type !== TASK_FINISHER) && (task.type !== TASK_LAUNCHER));
    }
}
