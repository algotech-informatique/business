import { SnPageWidgetDto, ApplicationModelDto, NotificationDto, SnPageDto } from '@algotech-ce/core';
import { EventData } from '../../../../models';
import { Component, EventEmitter } from '@angular/core';
import { Widget } from '../../widget.interface';
import { AuthService, DataService, NotificationsService } from '@algotech-ce/angular';
import { WorkflowLaunchService } from '../../../../../workflow-launcher/workflow-layout.lancher.service';

@Component({
  selector: 'widget-notification',
  templateUrl: './widget-notification.component.html',
  styleUrls: ['widget-notification.component.scss'],
})
export class WidgetNotificationComponent implements Widget {

    constructor(
        private authService: AuthService,
        private dataService: DataService,
        public notificationService: NotificationsService,
        private workflowLaunchService: WorkflowLaunchService,
    ) {
        this.initializeNotifications();
    }

    menuNotificationOpen = false;
    unread = 0;
    unreadMessage;
    lang = 'fr-FR';
    mobile = false;

    state: 'all' | 'unread' = 'all';
    notifications: NotificationDto[];

    appModel: ApplicationModelDto;
    snPage: SnPageDto;
    _widget: SnPageWidgetDto;
    event = new EventEmitter<EventData>();
    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    initialize() {
        window.addEventListener('click', (e) => {
            if (!document.getElementById('notification')?.contains(e.target as Node)) {
                this.menuNotificationOpen = false;
            }
        });
    }
    
    initializeNotifications() {
        this.notificationService.initialize(this.dataService.mobile ? 'mobile' : 'web');
        this.unread = this.notificationService.unread;
        this.unreadMessage = this.notificationService.unreadMessage;
        this.lang = this.authService.localProfil.preferedLang;
    }

    onClick() {
        this.menuNotificationOpen = !this.menuNotificationOpen;
    }

    onSelectNotification(notification: NotificationDto) {
        const login = this.authService.localProfil.login;
        if (notification.state.read.indexOf(login) === -1) {
            this.notificationService.patchProperty(notification.uuid, [{
                op: 'add',
                path: '/state/read/[?]',
                value: login
            }
            ]).subscribe(
                () => {
                    notification.state.read = [...notification.state.read, login];
                    this.notificationService.unread--;
                }
            );
        }
    }

    onOpenNotification(notification: NotificationDto) {
        const login = this.authService.localProfil.login;
        if (!notification.state.execute || notification.state.execute === login) {
            this.notificationService.patchProperty(notification.uuid, [{
                op: 'replace',
                path: '/state/execute',
                value: login
            }
            ]).subscribe(
                () => {
                    notification.state.execute = login;
                    this.launchNotification(notification);
                    this.menuNotificationOpen = false;
                }
            );
        }
    }

    launchNotification(notification: NotificationDto) {
        if (notification.action.key === 'workflow') {
            this.workflowLaunchService.launchInstance(notification.action.object);
        }
        if (notification.action.key === 'link') {
            window.open(notification.action.object, '_blank');
        }
    }
    
    onEndNotification() {
        this.notificationService.loadNotifications(this.state).subscribe(() => {
            this.notifications = [].concat(this.notificationService.notifications);
        });
    }

    onStateClick(state: 'all' | 'unread') {
        this.notificationService.reset();
        this.notificationService.loadNotifications(state, true).subscribe(() => {
            this.notifications = [].concat(this.notificationService.notifications);
        });
        this.state = state;
    }
}
