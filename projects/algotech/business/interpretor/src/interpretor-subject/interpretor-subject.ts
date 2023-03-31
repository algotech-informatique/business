import { WorkflowInstanceDto } from '@algotech-ce/core';
import { Subject } from 'rxjs';
import { InterpretorSubjectDto } from '../dto';

export class InterpretorSubject {
    private _subject: Subject<InterpretorSubjectDto>;

    constructor() {
        this._subject = new Subject();
    }

    get subject() {
        return this._subject;
    }

    next(value: InterpretorSubjectDto) {
        this._subject.next(value);
    }

    debug(instance: WorkflowInstanceDto) {
        this._subject.next({
            action: 'debug',
            date: null,
            success: true,
            value: instance,
        });
    }
}
