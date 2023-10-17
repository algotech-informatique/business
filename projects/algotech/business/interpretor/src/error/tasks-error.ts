export class NgComponentError extends Error {
    __proto__: Error;
    constructor(code: string, component: string, message: string) {
        const trueProto = new.target.prototype;
        super(`[${code}] {{${component}}}: ${message}`);

        // Alternatively use Object.setPrototypeOf if you have an ES6 environment.
        this.__proto__ = trueProto;
    }
}


export class TaskAssignObjectError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-OBJECT-ASSIGNMENT', message);
    }
}
export class TaskConditionV2Error extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-CONDITION', message);
    }
}
export class TaskConditionError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-CONDITION', message);
    }
}
export class TaskDeleteDocumentError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-DOCUMENT-DELETION', message);
    }
}
export class TaskScheduleDeleteError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-SCHEDULE-DELETION', message);
    }
}
export class TaskEmailError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-EMAIL', message);
    }
}
export class TaskFinisherError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-FINISHER', message);
    }
}
export class TaskLockDocumentError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-DOCUMENT-LOCK', message);
    }
}
export class TaskLoopError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-LOOP', message);
    }
}
export class TaskDataBufferError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-DATA-BUFFER', message);
    }
}

export class TaskObjectCreateError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-OBJECT-CREATION', message);
    }
}
export class TaskCreateObjectError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-OBJECT-CREATION', message);
    }
}
export class TaskObjectDeleteError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-OBJECT-DELETION', message);
    }
}
export class TaskObjectDownloadError  extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-OBJECT-DOWNLOAD', message);
    }
}
export class TaskObjectFilterError extends  NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-OBJECT-FILTER', message);
    }
}

export class TaskQueryBuilderError extends  NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-QUERY-BUILDER', message);
    }
}
export class TaskReportCreateError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-XREPORT', message);
    }
}
export class TaskScheduleCreateError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-SCHEDULE-CREATION', message);
    }
}
export class TaskServiceError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-SERVICE', message);
    }
}
export class TaskSkillsError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-SKILLS', message);
    }
}

export class TaskCsvMappedError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-CSV-MAPPED', message);
    }
}

export class TaskMappedError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-MAPPED', message);
    }
}
export class TaskMergeError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-MERGE', message);
    }
}
export class TaskConvertError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-DOCUMENT-CONVERT', message);
    }
}
export class TaskConnectorError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-CONNECTOR', message);
    }
}
export class TaskLayerMetadataError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-LAYER-METADATA', message);
    }
}
export class TaskRequestResultError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-REQUEST-RESULT', message);
    }
}
export class TaskDocumentFileZipError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-DOCUMENT-FILEZIP', message);
    }
}

export class TaskDocumentFileCreateError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-DOCUMENT-FILECREATE', message);
    }
}
export class TaskSwitchError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-SWITCH', message);
    }
}
export class TaskSleepError extends NgComponentError {
    constructor(code: string, message: string) {
        super(code, 'SN-SLEEP', message);
    }
}