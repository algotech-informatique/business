import { SnPageWidgetDto, ApplicationModelDto, WsUserDto, SnPageDto } from '@algotech-ce/core';
import { EventData } from '../../../../models';
import { Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { Widget } from '../../widget.interface';
import { AuthService } from '@algotech-ce/angular';

@Component({
  selector: 'widget-profile',
  templateUrl: './widget-profile.component.html',
  styleUrls: ['widget-profile.component.scss'],
})
export class WidgetProfileComponent implements Widget {

    @ViewChild('container', { static: true }) container: ElementRef;

    menuProfileOpen = false;
    currentUser: WsUserDto;
    userInfo: string;

    constructor(
        private authService: AuthService,
    ) {
        this.initializeProfile();
    }

    snPage: SnPageDto;
    appModel: ApplicationModelDto;
    _widget: SnPageWidgetDto;
    event = new EventEmitter<EventData>();
    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    initialize() {
        window.addEventListener('click', (e) => {
            if (!document.getElementById('profile')?.contains(e.target as Node)) {
                this.menuProfileOpen = false;
            }
        });
    }

    initializeProfile() {
        this.currentUser = {
            firstName: this.authService.localProfil.firstName,
            lastName: this.authService.localProfil.lastName,
            email: this.authService.localProfil.email,
            pictureUrl: this.authService.localProfil.pictureUrl,
            uuid: this.authService.localProfil.id,
            color: -1,
            focus: null
        };
        this.userInfo = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }

    onClick() {
        this.menuProfileOpen = !this.menuProfileOpen;
    }

}