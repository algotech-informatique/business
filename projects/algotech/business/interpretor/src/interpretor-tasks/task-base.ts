import { Observable } from 'rxjs';
import { InterpretorValidateDto, InterpretorJumpDto, InterpretorTaskDto, InterpretorFinisherDto } from '../dto';
import { ScheduleUtils } from '../@utils/schedule-utils';
import { SkillsUtils } from '../@utils/skills-utils';
import { SoUtils } from '../@utils/so-utils';
import { SysUtils } from '../@utils/sys-utils';
import { ReportsUtils } from '../@utils/reports-utils';
import { InterpretorUtils } from '../interpretor-utils/interpretor-utils';
import { InterpretorService } from '../interpretor-reader/interpretor-task/interpretor-service';
import { SmartFlowUtils } from '../@utils/smartflow-utils';
import { TaskUtils } from '../@utils';

export abstract class TaskBase {

    constructor(
        protected interpretorUtils: InterpretorUtils,
        protected interpretorService: InterpretorService,
        protected reportsUtils: ReportsUtils,
        protected scheduleUtils: ScheduleUtils,
        protected skillsUtils: SkillsUtils,
        protected soUtils: SoUtils,
        protected sysUtils: SysUtils,
        protected smartFlowUtils: SmartFlowUtils,
        protected taskUtils: TaskUtils) {
    }

    abstract execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto |
        InterpretorJumpDto | InterpretorFinisherDto>;
}
