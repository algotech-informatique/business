import { NgComponentError } from "../../../../interpretor/src/error/tasks-error";

export class TaskPaginateError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'PAGINATION-COMPONENT', message);
    }
}
export class WorkflowContainerError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'WORKFLOW-CONTAINER-COMPONENT', message);
    }
}

export class TaskCameraError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-CAMERA', message);
    }
}

export class TaskInputCaptureError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-INPUT', message);
    }
}
export class TaskMultiChoiceError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-MULTICHOICE', message);
    }
}

export class TaskQRCodeError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-QRCODE', message);
    }
}

export class TaskListError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-LIST', message);
    }
}

export class TaskUploadError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-DOCUMENT-UPLOAD', message);
    }
}
export class TaskEditDocumentError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-DOCUMENT-EDITION', message);
    }
}
export class TaskFormError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-FORM', message);
    }
}
export class TaskNotificationError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-NOTIFICATION', message);
    }
}
export class TaskReviewError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-REVIEW', message);
    }
}

export class TaskObjectCreateUIError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-OBJECT-UI-CREATION', message);
    }
}

export class TaskFileViewerError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-DOCUMENT-VIEWER', message);
    }
}

export class TaskDocumentListError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-DOCUMENT-LIST', message);
    }
}

export class TaskSignatureError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-SIGNATURE', message);
    }
}

export class TaskSiteLocationError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-GPS', message);
    }
}

export class TaskAlertError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-ALERT', message);
    }
}

export class TaskDownloadError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-DOCUMENT-DOWNLOAD', message);
    }
}

export class TaskScheduleCreateError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-SCHEDULE-CREATION', message);
    }
}

export class TaskGeolocationError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-GEOLOCATION', message);
    }
}

export class TaskAutoPhotoError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-CAMERA-AUTO', message);
    }
}

export class TaskDocumentLinkError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-DOCUMENT-LINK', message);
    }
}

export class TaskDocumentSelectError extends NgComponentError {
    constructor(code:string, message: string) {
        super(code, 'SN-DOCUMENT-SELECT', message);
    }
}
