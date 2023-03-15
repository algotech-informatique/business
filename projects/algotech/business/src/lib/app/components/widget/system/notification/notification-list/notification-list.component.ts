import { AuthService } from '@algotech/angular';
import { NotificationDto, SnPageDto, SnPageWidgetDto } from '@algotech/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input,
    OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['notification-list.component.scss'],
  animations: [
    trigger('fadeInOut', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate(250, style({ opacity: 1 }))
        ]),
        transition(':leave', [animate(500, style({ opacity: 0 }))])
    ])
]
})
export class NotificationListComponent implements OnInit, OnChanges {

    @ViewChild('container') container: ElementRef;

    @Input() notifications: NotificationDto[];
    @Input() lang: string[];
    @Input() unreadFullMessage = '';
    @Input() widget: SnPageWidgetDto;
    @Input() snPage: SnPageDto;
    @Input() state: 'all' | 'unread' = 'all';

    @Output() selectNotification = new EventEmitter<NotificationDto>();
    @Output() openNotification = new EventEmitter<NotificationDto>();
    @Output() endNotification = new EventEmitter();
    @Output() stateClick = new EventEmitter<'all' | 'unread'>();

    login = '';
    event;

    constructor(
        private authService: AuthService,
    ) {}

    ngOnInit() {
        this.login = this.authService.localProfil.login;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.notifications) {
            this.event?.target?.complete();
        }
    }

    doInfiniteWeb(event) {
        if ( (event.target.offsetHeight + event.target.scrollTop) >= event.target.scrollHeight) {
            this.endNotification.emit();
        }
    }

    onSelectNotification(notification: NotificationDto) {
        this.selectNotification.emit(notification);
    }

    onContinue(notification: NotificationDto) {
        this.openNotification.emit(notification);
    }

    onChangeState(event, state: 'all' | 'unread') {
        event.stopPropagation();
        this.stateClick.emit(state);
    }

}
