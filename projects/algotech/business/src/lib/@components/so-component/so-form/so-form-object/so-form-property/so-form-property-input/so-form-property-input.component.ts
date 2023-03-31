import { Component, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit, OnChanges } from '@angular/core';
import { SmartPropertyModelDto, SmartObjectDto, GenericListDto, GenericListValueDto } from '@algotech-ce/core';
import { SoFormService } from '../../../so-form.service';
import { TranslateService } from '@ngx-translate/core';
import {
    AuthService, TranslateLangDtoService, GestionDisplaySettingsService,
    GenericListsDisplayService, DataService
} from '@algotech-ce/angular';
import * as _ from 'lodash';
import { ISoFormAction, ISoFormBreadCrumb } from '../../../so-form-interface';
import { ISoItemObject } from '../../../../so-item/so-item.interface';
import moment from 'moment';
import { zip, of } from 'rxjs';
import { WorkflowDialogService } from '../../../../../../workflow-dialog/workflow-dialog.service';
import { WorkflowDialogOptions } from '../../../../../../workflow-dialog/interfaces';

interface TypeButton {
    key: string;
    icon: string;
    displayText: string;
}

@Component({
    selector: 'at-so-form-property-input',
    styleUrls: ['./so-form-property-input.component.scss'],
    templateUrl: './so-form-property-input.component.html',
})
export class SoFormPropertyInputComponent implements AfterViewInit, OnChanges {

    constructor(
        private glistDisplayService: GenericListsDisplayService,
        private translateLangDtoService: TranslateLangDtoService,
        private ref: ChangeDetectorRef,
        private authService: AuthService,
        private soFormService: SoFormService,
        private translate: TranslateService,
        private gestionDisplaySetting: GestionDisplaySettingsService,
        private workflowDialog: WorkflowDialogService,
        public dataService: DataService,
    ) { }

    @Input() property: SmartPropertyModelDto;
    @Input() value: any;
    @Input() area = false;
    @Input() display = null;
    @Input() disabled = false;
    @Input() unique = null;
    @Input() checkRequired = true;
    @Input() context = 'body';
    @Input() style = 'underline';
    @Input() label = 'stacked';
    @Input() removable = false;
    @Input() autoFocus = false;

    isLoading = false;
    isSwipe = false;

    _actionSearch: ISoFormAction = {
        key: 'search',
        icon: 'fa-solid fa-magnifying-glass',
        color: 'var(--ALGOTECH-PRIMARY)',
        caption: this.translate.instant('SO-FORM-SEARCH-OBJECT')
    };
    _actionAdd: ISoFormAction = {
        key: 'add',
        icon: 'fa-solid fa-file-circle-plus',
        color: 'var(--ALGOTECH-PRIMARY)',
        caption: this.translate.instant('SO-FORM-ADD-OBJECT'),
        component: 'object',
    };
    _actionEdit: ISoFormAction = {
        key: 'edit',
        icon: 'fa-solid fa-square-pen',
        color: 'var(--ALGOTECH-PRIMARY)',
        caption: this.translate.instant('SO-FORM-EDIT-OBJECT'),
        component: 'object',
    };
    _actionDelete: ISoFormAction = {
        key: 'delete',
        icon: 'fa-solid fa-trash',
        color: 'var(--ALGOTECH-DANGER)',
        caption: this.translate.instant('SO-FORM-DELETE-OBJECT')
    };
    _actionDetach: ISoFormAction = {
        key: 'detach',
        icon: 'fa-solid fa-trash',
        color: 'var(--ALGOTECH-DANGER)',
        caption: this.translate.instant('SO-FORM-DETACH-OBJECT')
    };
    _actionRemove: ISoFormAction = {
        key: 'remove',
        icon: 'fa-solid fa-trash',
        color: 'var(--ALGOTECH-DANGER)',
        caption: this.translate.instant('SO-FORM-DELETE-OBJECT')
    };

    option: any;
    object: ISoItemObject;
    glist: GenericListDto;
    error = '';
    message = '';

    @Output() changeView = new EventEmitter<ISoFormBreadCrumb>();
    @Output() changeValue = new EventEmitter;
    @Output() removeValue = new EventEmitter;

    actions: ISoFormAction[] = [];

    validate() {
        // option
        if (!this.validateOption()) {
            return;
        }

        if (!this.soFormService.itemIsValid(this.property, this.value)) {
            this.error = this.translate.instant('SO-FORM-ITEM-INVALID');
            return;
        } else if (this.checkRequired && (!this.soFormService.propertyIsValid(this.property, this.value))) {
            this.error = this.translate.instant('SO-FORM-REQUIRED-PROPERTY');
            return;
        } else if (this.unique === false) {
            this.error = this.translate.instant('SO-FORM-UNIQUE-PROPERTY');
            return;
        }

        this.error = '';
    }

    validateOption() {
        if (!this.option) {
            return true;
        }

        switch (this.property.keyType) {
            case 'number': {
                if (this.option.format) {
                    switch (this.option.format) {
                        case '0':
                            if (this.value) {
                                this.value = Math.trunc(this.value);
                            }
                            return true;
                        case '2':
                            if (this.value) {
                                this.value = Math.round(this.value * 100) / 100;
                            }
                            return true;
                    }
                }
                return true;
            }
            case 'string': {
                if (!this.glist) {
                    if (this.option.minlen && (!this.value || this.value.length < this.option.minlen)) {
                        this.error = this.translate.instant('SO-FORM-ITEM-CAR-MINIMUM', { car: this.option.minlen });
                        return false;
                    }
                }
            }
        }

        return true;
    }

    ngOnChanges() {
        this.validate();
    }

    ngAfterViewInit() {
        if (this.property.keyType === 'sys:comment' && this.value) {
            this.message = this.value.message;
        }

        this.option = this.soFormService.getOption(this.property, this.soFormService.current);
        if (this.property.keyType === 'string' && this.property.items && this.property.items !== '') {
            this.loadGenericList();
            
        }
        this.validate();
        this.loadObject();
    }

    loadGenericList() {

        this.glist = this.glistDisplayService.getSorted(this.property.items as string,
            (this.option && this.option?.sort) ? this.option.sort : 'default' );

        if (this.option?.pluggable) {
            this.soFormService.dataSource(this.property,-1, 1000, '').subscribe((data) => {
                this.glist.values = _.reduce(this.glist.values, (result, value: GenericListValueDto) => {
                    if (data.find((val) => (val) && value.key === val.key)) {
                        result.push(value);
                    }
                    return result;
                }, []);
            });
        }
    }

    loadObject() {
        if (this.property.keyType.startsWith('so:')) {
            const findSo = this.soFormService.getObjects(true).find((object) => object.uuid === this.value);
            const findPrivateSo = this.soFormService.getObjects(false).find((object) => object.uuid === this.value);

            const cbFindSo = (uuid) => of(_.find(this.soFormService.getObjects(true), (so) => so.uuid === uuid));

            zip(
                this.gestionDisplaySetting.validateNameFromSettings(findSo, 'icon', cbFindSo),
                this.gestionDisplaySetting.validateNameFromSettings(findSo, 'primary', cbFindSo),
                this.gestionDisplaySetting.validateNameFromSettings(findSo, 'secondary', cbFindSo),
                this.gestionDisplaySetting.validateNameFromSettings(findSo, 'tertiary', cbFindSo)
            ).pipe().subscribe(
                (values) => {
                    const iconValue = values[0] ? values[0] : findPrivateSo !== undefined ? 'fa-solid fa-cube' : 'fa-solid fa-cube';
                    this.object = {
                        data: findSo,
                        prop1: values[1],
                        prop2: values[2],
                        prop3: values[3],
                        icon: iconValue
                    };
                }
            );

            this.actions = [];
            if (this.property.composition) {
                this.loadCompositionActions(findSo !== undefined);
            } else {
                this.loadAssocationActions(findSo !== undefined, findPrivateSo !== undefined);
            }

            if (this.removable) {
                this.actions.push(this._actionRemove);
            }
        }
    }

    loadCompositionActions(hasSo: boolean) {
        if (!hasSo) {
            this.actions.push(this._actionAdd);
        } else {
            this.actions.push(this._actionEdit);
            if (!this.property.required && !this.property.multiple) {
                this.actions.push(this._actionDelete);
            }
        }
    }

    loadAssocationActions(hasSo: boolean, hasPrivateSo: boolean) {

        if (hasPrivateSo) {
            this.actions.push(this._actionEdit);
        } else {
            if (!this.property.multiple) {
                this.actions.push(this._actionSearch);
            }
        }

        if (!hasSo) {
            this.actions.push(this._actionAdd);
        } else {
            if (!this.property.multiple) {
                if (hasPrivateSo) {
                    this.actions.push(this._actionDelete);
                } else {
                    this.actions.push(this._actionDetach);
                }
            }
        }
    }

    onChangeValue(ev) {
        this.validate();
        this.changeValue.emit(this.soFormService.processValue(this.property, this.value));
    }

    onChangeComment() {
        const comment = {
            date: moment().format(),
            user: `${this.authService.localProfil.firstName} ${this.authService.localProfil.lastName}`,
            message: this.message
        };
        this.changeValue.emit(comment);
    }

    onItemClick() {
        if (!this.disabled && this.actions.length > 0 && !['remove', 'delete', 'detach'].includes(this.actions[0].key)) {
            this.executeAction(this.actions[0]);
        }
    }

    onActionClick(component) {
        const options: WorkflowDialogOptions = {
            actions: this.actions.map((action: ISoFormAction) => {
                return {
                    caption: action.caption,
                    icon: action.icon,
                    color: action.color,
                    key: action.key,
                    disabled: false,
                    onClick: () => {
                        this.executeAction(action);
                    }
                };
            }),
        };
        this.workflowDialog.openOptions(component, options);
    }

    executeAction(action: ISoFormAction) {
        if (!this.isLoading) {
            const _action: ISoFormAction = action ? action : this.actions[0];
            if (_action.key === 'remove') {
                this.removeValue.emit(_action);
                return;
            }
            this.soFormService.executeAction(_action.key, this.property, this.value).subscribe(
                (object: SmartObjectDto) => {
                    this.value = object ? object.uuid : null;
                    this.changeValue.emit(this.value);
                    if (_action.component) {
                        this.changeView.emit({
                            caption: this.display ? this.display : this.translateLangDtoService.transform(this.property.displayName),
                            data: {
                                component: _action.component,
                                componentProps: {
                                    object
                                }
                            }
                        });
                    } else {
                        this.isLoading = true;
                        this.ref.detectChanges();

                        this.loadObject();
                        this.validate();

                        this.isLoading = false;
                        this.ref.detectChanges();
                    }
                }
            );
        }
    }
}

