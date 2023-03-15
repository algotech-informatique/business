import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'at-so-form-property-input-photo-viewer',
    styleUrls: ['./so-form-property-input-photo-viewer.component.scss'],
    template: `
        <div class="content">
            <div class="topbar">
                <div class="at-button" (click)="onBack()">
                    <i class="fa-solid fa-chevron-left"></i>
                </div>
                <span></span>
                <div class="at-button" (click)="onDelete()" [ngClass]="{'disabled': disabled}">
                    <i class="fa-solid fa-trash"></i>
                </div>
            </div>
            <div class="img">
                <img [src]="b64" />
            </div>
        </div>
    `
})
export class SoFormPropertyInputPhotoViewerComponent {
    @Input() b64: string;
    @Input() disabled: boolean;
    @Output() deletePhoto = new EventEmitter();
    @Output() back = new EventEmitter();

    onDelete() {
        this.deletePhoto.emit();
    }

    onBack() {
        this.back.emit();
    }
}

