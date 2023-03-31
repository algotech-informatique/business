import { SnPageDto, SnPageWidgetDto, WsUserDto } from '@algotech-ce/core';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { style, animate, transition, trigger } from '@angular/animations';
import { AuthService, SocketManager } from '@algotech-ce/angular';
import { WS_USERS_COLORS } from '@algotech-ce/angular';

const COLOR_CURRENT_USER = '#495199';
const COLOR_DEFAULT = '#000000';

@Component({
  selector: 'widget-popup-profile',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['profile-popup.component.scss'],
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
export class ProfilePopupComponent {

    @ViewChild('container', { static: true }) container: ElementRef;

    @Input()currentUser: WsUserDto;
    @Input() userInfo: string;
    @Input() widget: SnPageWidgetDto;
    @Input() snPage: SnPageDto;

    isVisible = true;
    size = 35;

    constructor(
        private socketManager: SocketManager,
        private authService: AuthService,
    ) {
    }

    getName() {
        return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }

    getColor() {
        if (this.currentUser.color === -1) {
            return COLOR_CURRENT_USER;
        } else {
            if (this.currentUser.color < WS_USERS_COLORS.length) {
                return WS_USERS_COLORS[this.currentUser.color];
            }
            return COLOR_DEFAULT;
        }
    }

    ongletClick(ongletID: string) {
        switch (ongletID) {
            case 'logout': {
                this.socketManager.close();
                this.authService.logout().subscribe();
                break;
            }
            default: {
                // this.ongletClicked.emit(ongletID);
            }
        }
    }
}