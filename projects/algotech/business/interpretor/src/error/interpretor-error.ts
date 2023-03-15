import { WorkflowInstanceDto } from '@algotech/core';
import { NgComponentError } from './tasks-error';

export class WorkflowError extends NgComponentError {
    __proto__: Error;
    instance: WorkflowInstanceDto;
    constructor(code: string, error: string, message: string, instance?: WorkflowInstanceDto) {
        const trueProto = new.target.prototype;
        super(code, error, message);

        if (instance) {
            this.instance = instance;
        }

        // Alternatively use Object.setPrototypeOf if you have an ES6 environment.
        this.__proto__ = trueProto;
    }
}
export class WorkflowErrorUnauthorizedProfil extends WorkflowError {
    constructor(instance: WorkflowInstanceDto, code: string, message: string) {
        super(code, 'UNAUTHORIZED-PROFILE', message, instance);
    }
}

export class WorkflowErrorOldInstance extends WorkflowError {
    constructor(instance: WorkflowInstanceDto, code: string, message: string) {
        super(code, 'OLD-INSTANCE', message, instance);
    }
}

export class WorkflowErrorTodo extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'TODO', message);
    }
}

export class WorkflowErrorSettingsNotValid extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'SETTINGS-NOT-VALID', message);
    }
}
export class WorkflowErrorProfilNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'PROFILE-NOT-FOUND', message);
    }
}

export class WorkflowErrorSmartObjectNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'SMARTOBJECT', message);
    }
}
export class WorkflowErrorSmartModelNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'SMARTMODEL', message);
    }
}
export class WorkflowErrorSysModelNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'SYS-MODEL', message);
    }
}
export class WorkflowErrorPropertyNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'PROPERTY', message);
    }
}
export class WorkflowErrorDataNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'DATA', message);
    }
}
export class WorkflowErrorExpression extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'WORKFLOW-EXPRESSION', message);
    }
}
export class WorkflowErrorCustomNotValid extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'CUSTOM', message);
    }
}

export class WorkflowErrorActiveTaskNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'ACTIVE-TASK', message);
    }
}
export class WorkflowErrorTransitionNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'TRANSITION', message);
    }
}
export class WorkflowErrorTaskNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'TASK', message);
    }
}
export class WorkflowErrorModelNotValid extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'WORKFLOW-MODEL', message);
    }
}
export class WorkflowErrorReader extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'WORKFLOW-READER', message);
    }
}
export class WorkflowErrorJumped extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'GOTO', message);
    }
}
export class WorkflowErrorNotActionReversed extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'NotActionReversed', message);
    }
}

export class WorkflowErrorAction extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'ACTION', message);
    }
}

export class WorkflowErrorPlaceToSaved extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'SAVED', message);
    }
}
export class WorkflowErrorScheduled extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'WOKFLOW-SCHEDULE', message);
    }
}

export class WorkflowErrorSynchronize extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'WORKFLOW-SYNCHRONIZATION', message);
    }
}
export class WorkflowErrorInstanceNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'WORKFLOW-INSTANCE', message);
    }
}
export class WorkflowErrorModelNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'WORKFLOW-MODEL', message);
    }
}

export class WorkflowErrorAssetNotFind extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'ASSET', message);
    }
}

export class WorkflowErrorMagnet extends WorkflowError {
    constructor(code: string, message: string) {
        super(code, 'MAGNET', message);
    }
}
