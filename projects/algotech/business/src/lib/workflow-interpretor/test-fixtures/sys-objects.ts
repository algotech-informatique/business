import { NotificationDto } from '@algotech/core';


export const fixtSysNotify: NotificationDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7enn',
    title: 'Ma notification',
    content: 'Mon content',
    author: 'Marcel Patulacci',
    date: '2019-02-01T18:25:43.511Z',
    icon: 'fa-solid fa-file-arrow-up',
    state: {
        from: 'jford',
        to: ['technician'],
        read: [],
    },
    action: {
        key: 'workflow',
    },
};

export const fixtSysNotifyUpdate: NotificationDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7enn',
    title: 'Ma notification',
    content: 'Mon content',
    author: 'Marcel Patulacci',
    date: '2019-02-01T18:25:43.511Z',
    icon: 'fa-solid fa-file-arrow-up',
    state: {
        from: 'jford',
        to: ['technician'],
        read: [],
    },
    action: {
        key: 'workflow',
    },
    comment: 'comment'
};
