import { BreadCrumbDto } from '../../../../interpretor/src/dto';

export const fixStepBreadCrumbDtoDocument: BreadCrumbDto[] = [
    {
        active: true,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Proposition de document',
            },
            {
                lang: 'en-US',
                value: 'Document submission',
            },
        ],
        profil: 'Emitter',
    }, {
        active: false,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Revue',
            },
            {
                lang: 'en-US',
                value: 'Review',
            },
        ],
        profil: 'Reviewers',
    }];
export const fixStepBreadCrumbDtoBeforeFinished: BreadCrumbDto[] = [
    {
        active: false,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Proposition de document',
            },
            {
                lang: 'en-US',
                value: 'Document submission',
            },
        ],
        profil: 'Emitter',
    }, {
        active: true,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Revue',
            },
            {
                lang: 'en-US',
                value: 'Review',
            },
        ],
        profil: 'Reviewers',
    }];

export const fixStepBreadCrumbDtoDocumentAfterJump: BreadCrumbDto[] = [
    {
        active: true,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Proposition de document',
            },
            {
                lang: 'en-US',
                value: 'Document submission',
            },
        ],
        profil: 'Emitter',
    }, {
        active: false,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Revue',
            },
            {
                lang: 'en-US',
                value: 'Review',
            },
        ],
        profil: 'Reviewers',
    }, {
        active: false,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Revision',
            },
            {
                lang: 'en-US',
                value: 'Révision',
            },
        ],
        profil: 'Emitter',
    }];

export const fixStepBreadCrumbDtoReview: BreadCrumbDto[] = [
    {
        active: false,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Proposition de document',
            },
            {
                lang: 'en-US',
                value: 'Document submission',
            },
        ],
        profil: 'Emitter',
    }, {
        active: true,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Revue',
            },
            {
                lang: 'en-US',
                value: 'Review',
            },
        ],
        profil: 'Reviewers',
    }, {
        active: false,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Revision',
            },
            {
                lang: 'en-US',
                value: 'Révision',
            },
        ],
        profil: 'Emitter',
    }];

export const fixStepBreadCrumbDtoRevision: BreadCrumbDto[] = [
    {
        active: false,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Proposition de document',
            },
            {
                lang: 'en-US',
                value: 'Document submission',
            },
        ],
        profil: 'Emitter',
    }, {
        active: false,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Revue',
            },
            {
                lang: 'en-US',
                value: 'Review',
            },
        ],
        profil: 'Reviewers',
    }, {
        active: true,
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Revision',
            },
            {
                lang: 'en-US',
                value: 'Révision',
            },
        ],
        profil: 'Emitter',
    }];

export const fixtTaskBreadCrumbTodo: BreadCrumbDto[] = [{
    active: true,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Selection d un equipement',
        },
        {
            lang: 'en-US',
            value: 'Equipment selection',
        },
    ],
    profil: 'Emitter',
}, {
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Upload d un document',
        },
        {
            lang: 'en-US',
            value: 'Document upload',
        },
    ],
    profil: 'Emitter',
}, {
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Formulaire de document',
        },
        {
            lang: 'en-US',
            value: 'Document form',
        },
    ],
    profil: 'Emitter',
}, {
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Notification des reviewers',
        },
        {
            lang: 'en-US',
            value: 'Notify reviewers',
        },
    ],
    profil: 'Emitter',
}];

export const fixtTaskBreadCrumbUpload: BreadCrumbDto[] = [{
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155a',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Selection d un equipement',
        },
        {
            lang: 'en-US',
            value: 'Equipment selection',
        },
    ],
    profil: 'Emitter',
}, {
    active: true,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Upload d un document',
        },
        {
            lang: 'en-US',
            value: 'Document upload',
        },
    ],
    profil: 'Emitter',
}, {
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155c',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Formulaire de document',
        },
        {
            lang: 'en-US',
            value: 'Document form',
        },
    ],
    profil: 'Emitter',
}, {
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155d',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Notification des reviewers',
        },
        {
            lang: 'en-US',
            value: 'Notify reviewers',
        },
    ],
    profil: 'Emitter',
}];

export const fixtTaskBreadCrumbDocumentForm: BreadCrumbDto[] = [{
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155a',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Selection d un equipement',
        },
        {
            lang: 'en-US',
            value: 'Equipment selection',
        },
    ],
    profil: 'Emitter',
}, {
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155b',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Upload d un document',
        },
        {
            lang: 'en-US',
            value: 'Document upload',
        },
    ],
    profil: 'Emitter',
}, {
    active: true,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Formulaire de document',
        },
        {
            lang: 'en-US',
            value: 'Document form',
        },
    ],
    profil: 'Emitter',
}, {
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155d',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Notification des reviewers',
        },
        {
            lang: 'en-US',
            value: 'Notify reviewers',
        },
    ],
    profil: 'Emitter',
}];

export const fixtTaskBreadCrumbNotifyReviewers: BreadCrumbDto[] = [{
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155a',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Selection d un equipement',
        },
        {
            lang: 'en-US',
            value: 'Equipment selection',
        },
    ],
    profil: 'Emitter',
}, {
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155b',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Upload d un document',
        },
        {
            lang: 'en-US',
            value: 'Document upload',
        },
    ],
    profil: 'Emitter',
}, {
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155c',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Formulaire de document',
        },
        {
            lang: 'en-US',
            value: 'Document form',
        },
    ],
    profil: 'Emitter',
}, {
    active: true,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Notification des reviewers',
        },
        {
            lang: 'en-US',
            value: 'Notify reviewers',
        },
    ],
    profil: 'Emitter',
}];

export const fixtTaskBreadCrumbCheckNotifyReviewers: BreadCrumbDto[] = [{
    active: true,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Verification du reviewer',
        },
        {
            lang: 'en-US',
            value: 'Reviewers Check',
        },
    ],
    profil: 'Reviewers',
}];

export const fixtTaskBreadCrumbCheckNotifyReviewersAfterJump: BreadCrumbDto[] = [{
    active: true,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Verification du reviewer',
        },
        {
            lang: 'en-US',
            value: 'Reviewers Check',
        },
    ],
    profil: 'Reviewers',
}, {
    stackUUID: '031fa2ba-b758-4885-8d93-d430f790155f',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Notification à tous',
        },
        {
            lang: 'en-US',
            value: 'Notify all',
        },
    ],
    profil: 'Reviewers',
}];


export const fixtTaskBreadCrumbNextAvoidFirstTask: BreadCrumbDto[] = [{
    active: true,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Step01'
        },
        {
            lang: 'en-US',
            value: 'Step01'
        }
    ],
    profil: 'User',
}, {
    stackUUID: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39012',
    active: false,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Step02'
        },
        {
            lang: 'en-US',
            value: 'Step02'
        }
    ],
    profil: 'User',
}];

export const fixtTaskBreadCrumbPreviousAvoidLastTask: BreadCrumbDto[] = [{
    active: false,
    stackUUID: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39013',
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Step01'
        },
        {
            lang: 'en-US',
            value: 'Step01'
        }
    ],
    profil: 'User',
}, {
    active: true,
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Step02'
        },
        {
            lang: 'en-US',
            value: 'Step02'
        }
    ],
    profil: 'User',
}];
