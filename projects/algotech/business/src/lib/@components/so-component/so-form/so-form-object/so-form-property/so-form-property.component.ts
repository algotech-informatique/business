import { Component, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SmartPropertyObjectDto, SmartPropertyModelDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { SoFormService } from '../../so-form.service';
import { TranslateService } from '@ngx-translate/core';
import { ISoFormProperty, ISoFormBreadCrumb } from '../../so-form-interface';
import { TranslateLangDtoService } from '@algotech-ce/angular';
import { Platform } from '@ionic/angular';
import { zip, Observable } from 'rxjs';

@Component({
    selector: 'at-so-form-property',
    styleUrls: ['./so-form-property.component.scss'],
    templateUrl: './so-form-property.component.html',
})
export class SoFormPropertyComponent implements AfterViewInit {

    @Input() property: SmartPropertyModelDto;
    @Input() value: any;
    @Input() disabled = false;
    @Input() unique = null;
    @Input() autoFocus = false;
    @Input() comment: ISoFormProperty;
    @Input() file: ISoFormProperty;

    showMultiple = false;
    error = '';
    multipleValue = {
        undefined: true,
        text: ''
    };

    constructor(
        public platform: Platform,
        private translateLangDtoService: TranslateLangDtoService,
        private ref: ChangeDetectorRef,
        private translate: TranslateService,
        private soFormService: SoFormService,
    ) { }

    @Output() changeView = new EventEmitter<ISoFormBreadCrumb>();
    @Output() changeValue = new EventEmitter();

    onChangeValue(property: SmartPropertyModelDto, value: any) {

        const valueFilled: SmartPropertyObjectDto = {
            key: property.key, value
        };

        this.soFormService.setProperty(valueFilled);
        this.validateMultiple();
        this.changeValue.emit(valueFilled);
    }

    ngAfterViewInit() {
        this.calculateMultiple();
        this.validateMultiple();
        this.ref.detectChanges();
    }

    onChangeView(event: ISoFormBreadCrumb) {
        this.changeView.emit(event);
    }

    validateMultiple() {
        // multiple
        if (this.showMultiple) {
            if (!this.soFormService.itemIsValid(this.property, this.value)) {
                this.error = this.translate.instant('SO-FORM-ITEM-INVALID');
            } else if (!this.soFormService.propertyIsValid(this.property, this.value)) {
                this.error = this.translate.instant('SO-FORM-REQUIRED-PROPERTY');
            } else {
                this.error = '';
            }
        }
    }

    calculateMultiple() {
        if (!_.isArray(this.value) || !this.property.multiple) { return; }

        // except glist
        this.showMultiple = !(this.property.keyType === 'string' && this.property.items && this.property.items !== '');
        if (this.showMultiple) {

            const value$: Observable<any>[] =
                _.map(this.value, (value) => this.soFormService.unprocessValue(this.property.keyType, value));
            if (value$.length === 0) {
                this.multipleValue = {
                    undefined: true,
                    text: ''
                };
                return;
            }
            zip(...value$).subscribe((values) => {
                this.multipleValue = {
                    undefined: false,
                    text: values.join(', '),
                };
            });
        }
    }

    openMultiple() {
        (document.activeElement as HTMLElement).blur();
        const event: ISoFormBreadCrumb = {
            caption: this.translateLangDtoService.transform(this.property.displayName),
            data: {
                component: 'mutliple',
                componentProps: {
                    property: this.property,
                    disabled: this.disabled,
                    values: this.value,
                }
            }
        };

        this.changeView.emit(event);
    }

}

