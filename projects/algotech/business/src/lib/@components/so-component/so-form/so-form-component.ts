import {
    Component, Input, Output, EventEmitter, ViewChild, ComponentFactoryResolver, OnChanges, ElementRef, ChangeDetectorRef, Type
} from '@angular/core';
import { SmartObjectDto, TagListDto, WorkflowInstanceDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { SoFormObjectComponent } from './so-form-object/so-form-object.component';
import { SoFormDirective } from './so-form.directive';
import { SoFormMultipleComponent } from './so-form-multiple/so-form-multiple.component';
import { UUID } from 'angular2-uuid';
import { ISoFormBreadCrumb, ISoFormComponent } from './so-form-interface';
import { SoFormService } from './so-form.service';
import { TranslateLangDtoService } from '@algotech-ce/angular';
import { PropertiesOptionsDto } from '../../../dto/properties-options.dto';
import { InterpretorTaskActionAssetDto } from '../../../../../interpretor/src/dto';

@Component({
    selector: 'at-so-form',
    styleUrls: ['./so-form-component.scss'],
    template: `
        <div class="container" [style.paddingTop.px]="breadCrumbVisible ? 40 : 0">
            <div class="description" *ngIf="description !== null && description !== undefined && description !== ''">{{ description }}</div>
            <ul class="breadcrumb" #breadcrumb *ngIf="breadCrumbVisible">
                <li *ngFor="let data of breadCrumb">
                    <a (click)="onLoadBreadCrumb(data)">
                        {{ data.caption }}
                    </a>
                </li>
            </ul>
            <div class="custom" #custom>
                <ng-template so-form-host>
                </ng-template>
            </div>
        </div>
    `,
})
export class SoFormComponent implements OnChanges {

    @ViewChild('custom', { static: true }) custom: ElementRef;
    @ViewChild('breadcrumb', { static: false }) breadcrumb: ElementRef;
    @ViewChild(SoFormDirective, { static: true }) soForm: SoFormDirective;

    @Input()
    object: SmartObjectDto;

    @Input()
    objects: SmartObjectDto[] = [];

    @Input()
    addedObjects: SmartObjectDto[] = [];

    @Input()
    options: PropertiesOptionsDto[] = null;

    @Input()
    instance: WorkflowInstanceDto;

    @Input()
    readOnly = false;

    @Input()
    contextUuid: string = null;

    @Input()
    description: string;

    @Input() tagsLists: TagListDto[];
    @Input() taggable: boolean;
    @Input() tags: string[];

    activeBreadCrumb: ISoFormBreadCrumb = null;
    breadCrumb: ISoFormBreadCrumb[] = [];
    breadCrumbVisible = false;

    @Output() changeValue = new EventEmitter<{
        smartObjects: SmartObjectDto[],
        actions: InterpretorTaskActionAssetDto[],
        valid: boolean }>();

    constructor(
        private translateLangDtoService: TranslateLangDtoService,
        private ref: ChangeDetectorRef,
        private soFormService: SoFormService,
        private componentFactoryResolver: ComponentFactoryResolver,
    ) { }

    _change() {
        const objects = this.soFormService.getObjects(false);
        this.changeValue.emit({
            smartObjects: objects,
            actions: this.soFormService.actions,
            valid: this.soFormService.objectIsValid(this.object)
        });
    }

    onLoadBreadCrumb(breadCrumb: ISoFormBreadCrumb) {
        this.loadBreadCrumb(breadCrumb);
    }

    ngOnChanges() {
        if (this.object) {
            this.soFormService.initialize(this.readOnly, this.options, this.contextUuid, this.instance);

            if (this.object) {
                this.soFormService.loadObjects(this.object, this.objects, this.addedObjects);
            }

            const data: ISoFormComponent = {
                component: 'object',
                componentProps: {
                    object: this.object,
                }
            };
            if (this.taggable) {
                data.componentProps.taggable = this.taggable;
                data.componentProps.tagsLists = this.tagsLists;
                data.componentProps.tags = this.tags;
            }

            const breadCrumb: ISoFormBreadCrumb = {
                caption: this.translateLangDtoService.transform(
                    this.soFormService.getModel(this.object.modelKey).displayName
                ),
                data
            };

            this.loadBreadCrumb(breadCrumb, false);
            this._change();
        }
    }

    private loadBreadCrumb(breadCrumb: ISoFormBreadCrumb, visible = true) {
        this.breadCrumbVisible = visible;

        const findIndex = _.findIndex(this.breadCrumb, (d) => d.uuid === breadCrumb.uuid);
        if (findIndex > -1) {
            this.breadCrumb.splice(findIndex, this.breadCrumb.length);
        }
        this.breadCrumb.push(breadCrumb);

        if (!breadCrumb.uuid) {
            breadCrumb.uuid = UUID.UUID();
        }
        if (this.activeBreadCrumb) {
            this.activeBreadCrumb.scroll = this.custom.nativeElement.scrollTop;
        }
        this.activeBreadCrumb = breadCrumb;
        this.loadComponent(breadCrumb.data, breadCrumb.scroll);
    }

    private loadComponent(component: ISoFormComponent, scroll?: number) {
        const cmp: Type<unknown> = component.component === 'mutliple' ? SoFormMultipleComponent : SoFormObjectComponent;
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(cmp);
        const viewContainerRef = this.soForm.viewContainerRef;

        viewContainerRef.clear();

        const componentRef = viewContainerRef.createComponent(componentFactory);

        const onChangeValue = new EventEmitter<any>();
        const onChangeView = new EventEmitter<any>();
        switch (cmp) {
            case SoFormObjectComponent:
                (<SoFormObjectComponent>componentRef.instance).object = component.componentProps.object;
                (<SoFormObjectComponent>componentRef.instance).taggable = component.componentProps.taggable;
                (<SoFormObjectComponent>componentRef.instance).tagsLists = component.componentProps.tagsLists;
                (<SoFormObjectComponent>componentRef.instance).tags = component.componentProps.tags;
                (<SoFormObjectComponent>componentRef.instance).changeValue = onChangeValue;
                (<SoFormObjectComponent>componentRef.instance).changeView = onChangeView;
                (<SoFormObjectComponent>componentRef.instance).initialize();
                break;

            case SoFormMultipleComponent:
                const onAdd = new EventEmitter<any>();
                (<SoFormMultipleComponent>componentRef.instance).property = component.componentProps.property;
                (<SoFormMultipleComponent>componentRef.instance).values = component.componentProps.values;
                (<SoFormMultipleComponent>componentRef.instance).disabled = component.componentProps.disabled;
                (<SoFormMultipleComponent>componentRef.instance).changeValue = onChangeValue;
                (<SoFormObjectComponent>componentRef.instance).changeView = onChangeView;
                (<SoFormMultipleComponent>componentRef.instance).added = onAdd;
                (<SoFormMultipleComponent>componentRef.instance).initialize();
                onAdd.subscribe(() => {
                    this.ref.detectChanges();
                    this.custom.nativeElement.scrollTop = this.custom.nativeElement.scrollHeight;
                });
                break;
        }
        onChangeView.subscribe((data) => this.loadBreadCrumb(data));
        onChangeValue.subscribe(() => this._change());

        // scroll
        this.ref.detectChanges();
        if (this.breadcrumb) {
            this.breadcrumb.nativeElement.scrollLeft = this.breadcrumb.nativeElement.scrollWidth;
        }
        componentRef.hostView.detectChanges();
        if (scroll) {
            this.custom.nativeElement.scrollTop = scroll;
        } else {
            this.custom.nativeElement.scrollTop = 0;
        }
    }
}
