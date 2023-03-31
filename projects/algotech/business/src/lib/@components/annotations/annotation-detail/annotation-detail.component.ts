import { AnnotationDto } from '@algotech-ce/core';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { CustomOptionEditorComponent } from '../../custom-popover/custom-editor/custom-editor.component';
import { WorkflowDialogService } from '../../../workflow-dialog/workflow-dialog.service';
import * as _ from 'lodash';
import { AuthService } from '@algotech-ce/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { CustomColorComponent } from '../../custom-popover/custom-color/custom-color.component';
import { CameraFile } from '../../../dto/camera-file.dto';
@Component({
    selector: 'at-annotation-detail',
    styleUrls: ['./annotation-detail.component.scss'],
    templateUrl: './annotation-detail.component.html'
})
export class AnnotationDetailComponent implements OnChanges, AfterViewInit {

    @ViewChild('container', { static: true }) container: ElementRef;
    @ViewChild('img', { static: false }) imgElement: ElementRef;

    @Input() currentPhoto: CameraFile;
    @Input() consultation: boolean;
    @Input() edition: boolean;
    @Input() photo = true;
    @Input() fileNameVisible: boolean;

    @Output() deleteImage = new EventEmitter();
    @Output() resetImages = new EventEmitter();
    @Output() annotationsChange = new EventEmitter();
    @Output() downloadDoc = new EventEmitter<string>();

    annotations: AnnotationDto[] = [];
    color = '#37474F';

    activateAnnotation = false;
    selectedItem: AnnotationDto;
    containerHeight: number;

    _origin: { x: number, y: number } = { x: 0, y: 0 };
    DEFAULT_RAYON = 15;

    currentAnnotation = null;
    moving = 0;
    dragOffset = [0, 0];
    editAnnotation = -1;
    editAnnotationMenu = [
        {
            key: 'edit',
            text: this.translateService.instant('IMAGE.ACTIONS.EDIT-ANNOTATION'),
            icon: 'fa-solid fa-pen-to-square',
        }, {
            key: 'color',
            text: this.translateService.instant('IMAGE.ACTIONS.EDIT-ANNOTATION-COLOR'),
            icon: 'fa-solid fa-palette',
        }, {
            key: 'delete',
            text: this.translateService.instant('IMAGE.ACTIONS.EDIT-ANNOTATION-DELETE'),
            icon: 'fa-solid fa-trash',
        },
    ];

    constructor(
        private readonly authService: AuthService,
        private translateService: TranslateService,
        private workflowDialog: WorkflowDialogService,
        private zone: NgZone,
    ) { }

    ngAfterViewInit() {
        this.changeSize();
        new ResizeObserver(() => this.changeSize()).observe(this.container.nativeElement);
    }

    changeSize() {
        this.zone.run(() => {
            this.containerHeight = this.container.nativeElement.clientHeight;
        });
    }

    ngOnChanges() {
        this.loadPointsAnnotations();
    }

    downloadDocument() {
        if (this.edition === false) {
            this.downloadDoc.emit(this.currentPhoto.versionID);
        }
    }

    onOpenActions(event, element) {
        event.stopPropagation();
        this.workflowDialog.openOptions(element, {
            actions: _.compact([
                this.edition ? {
                    icon: 'fa-solid fa-thumbtack',
                    caption: this.translateService.instant('IMAGE.ACTIONS.CREATE'),
                    color: 'var(--ALGOTECH-PRIMARY)',
                    disabled: false,
                    onClick: () => {
                        this.activateAnnotation = true;
                    },
                } : null, {
                    icon: 'fa-solid fa-trash',
                    caption: this.translateService.instant('IMAGE.ACTIONS.REMOVE'),
                    color: 'var(--ALGOTECH-DANGER)',
                    disabled: false,
                    onClick: () => {
                        this.deleteImage.emit();
                    },
                }])
        });
    }

    onOpenMenuAnnotation(event, index) {
        if (this.edition === false) {
            return;
        }
        event.stopPropagation();
        this.editAnnotation = this.editAnnotation = index;
    }

    onSelectMenu(event, data, element: AnnotationDto) {
        this.editAnnotation = -1;
        if (!data) {
            return;
        }
        switch (data) {
            case 'edit':
                this.addAnnotation(event, element.annotation, element.uuid);
                break;
            case 'color':
                this.onOpenColor(event, element);
                break;
            case 'delete':
                this.deleteAnnotation(element.uuid);
                break;
        }
    }

    onOpenColor(event, element: AnnotationDto) {
        event.stopPropagation();
        const selected = new EventEmitter();
        this.workflowDialog.showPopup.next({
            component: CustomColorComponent,
            width: 160,
            props: {
                color: element.zone.color,
                selected,
            },
        });

        selected.pipe(
            map((data: string) => {
                this.workflowDialog.dismiss();
                if (!data) {
                    return;
                }
                element.zone.color = data;
                this.updateAnnotation(element);
            })).subscribe();
    }

    loadPointsAnnotations() {
        this.annotations = this.currentPhoto?.annotations;
    }

    addAnnotation(event, text: string, uuid: string) {

        event.stopPropagation();
        const pos = {
            x: ((event.offsetX - 10) / this.imgElement.nativeElement.width) * 100,
            y: ((event.offsetY - 10) / this.imgElement.nativeElement.height) * 100,
        };
        const changed = new EventEmitter();
        this.workflowDialog.showPopup.next({
            component: CustomOptionEditorComponent,
            props: {
                uuid,
                editText: text,
                title: (uuid === '') ?
                    this.translateService.instant('TASK-MODEL-GUI.TASK.ANNOTATION.NEW-ITEM') :
                    this.translateService.instant('TASK-MODEL-GUI.TASK.ANNOTATION.EDIT-ITEM'),
                placeHolder: this.translateService.instant('TASK-MODEL-GUI.TASK.ANNOTATION.PLACE_HOLDER'),
                changed,
            }
        });

        changed.subscribe((data: string) => {
            this.workflowDialog.dismiss();
            if (!data) {
                return;
            }
            this.createAnnotation(data, uuid, pos.x, pos.y);
        });
    }

    deleteAnnotation(uuid: string) {
        const id = _.findIndex(this.annotations, (annotation: AnnotationDto) => annotation.uuid === uuid);
        if (id !== -1) {
            this.annotations.splice(id, 1);
        }
        this.setAnnotationChange();
    }

    createAnnotation(message, uuid, positionX: number, positionY: number) {
        message = (message !== '') ? message : '-';
        let myAnnotation: AnnotationDto = null;
        if (uuid === '') {
            const myUuid = UUID.UUID();
            myAnnotation = {
                author: this.authService.localProfil.lastName + ', ' + this.authService.localProfil.firstName,
                userID: this.authService.localProfil.id,
                annotation: message,
                dateCreation: moment().format(),
                zone: {
                    positionX,
                    positionY,
                    rayon: 0,
                    color: this.color,
                },
                uuid: myUuid
            };
        } else {
            myAnnotation = _.find(this.annotations, (ann: AnnotationDto) => ann.uuid === uuid);
            myAnnotation.annotation = message;
        }

        if (uuid === '') {
            this.annotations.push(myAnnotation);
        }
        this.setAnnotationChange();
    }

    updateAnnotation(element: AnnotationDto) {
        if (!element) {
            return;
        }
        const eAnnotations: AnnotationDto[] = _.cloneDeep(this.annotations);
        const index = _.findIndex(eAnnotations, (ann: AnnotationDto) => element.uuid === ann.uuid);
        if (index !== -1) {
            eAnnotations[index] = element;
            this.annotations = eAnnotations;
            this.setAnnotationChange();
        }
    }

    onTouchClick(event) {
        if (this.activateAnnotation) {
            this.addAnnotation(event, '', '');
            this.activateAnnotation = false;
        } else {
            this.downloadDocument();
        }
        this.editAnnotation = -1;
    }

    mousePosition(event) {
        return {
            x: event.changedTouches ? event.changedTouches[0].clientX : event.clientX,
            y: event.changedTouches ? event.changedTouches[0].clientY : event.clientY,
        };
    }

    mousedown(event, item: AnnotationDto) {
        event.stopPropagation();
        if (this.edition === false) {
            return;
        }
        this.moving++;
        this.currentAnnotation = item;
        const dialogBox = document.getElementById(item.uuid);
        if (dialogBox) {
            const mousePosition = this.mousePosition(event);
            this.dragOffset = [
                dialogBox.offsetLeft - mousePosition.x,
                dialogBox.offsetTop - mousePosition.y,
            ];
        }
    }

    mousemove(event) {
        event.preventDefault();
        if (this.moving) {
            this.editAnnotation = -1;
            this.moving++;
            this.updatePosition();
        }
    }

    mouseup(event, item: AnnotationDto, index: number) {
        event.stopPropagation();

        if (this.moving <= 1) {
            this.moving = 0;
            this.onOpenMenuAnnotation(event, index);
            return;
        }
        this.moving = 0;
        this.updatePosition();
        this.updateAnnotation(item);
    }

    updatePosition() {
        if (!this.currentAnnotation) {
            return;
        }
        const mousePosition = this.mousePosition(event);
        const zonePosition = {
            posX: ((mousePosition.x + this.dragOffset[0]) / this.imgElement.nativeElement.width) * 100,
            posY: ((mousePosition.y + this.dragOffset[1]) / this.imgElement.nativeElement.height) * 100
        };
        zonePosition.posX = Math.max(0, Math.min(100, zonePosition.posX));
        zonePosition.posY = Math.max(0, Math.min(100, zonePosition.posY));

        this.currentAnnotation.zone.positionX = zonePosition.posX;
        this.currentAnnotation.zone.positionY = zonePosition.posY;
    }

    setAnnotationChange() {
        this.currentPhoto.annotations = this.annotations;
        this.annotationsChange.emit();
    }
}
