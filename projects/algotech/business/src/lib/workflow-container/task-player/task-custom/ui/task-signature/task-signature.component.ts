import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto, WorkflowTaskActionSignDto } from '../../../../../../../interpretor/src/dto';
import { TaskSignatureDto } from '../../../../dto/task-signature.dto';
import { SmartObjectDto, ATSignatureDto } from '@algotech-ce/core';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { UUID } from 'angular2-uuid';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { AuthService } from '@algotech-ce/angular';
import moment from 'moment';
import { TaskSignatureError } from '../../../../container-error/container-error';
import SignaturePad from 'signature_pad';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';


const SIGNATURE_NAME = 'signature.png';
const SIGNATURE_TYPE = 'image/png';

@Component({
    template: `
    <div>
        <div class="content">
            <i class="fa-solid fa-signature fa-4x sign" *ngIf="hasImg"></i>
            <canvas
                #myCanvas
                class="signature-content"
                (pointerdown)="onMouseDown($event)"
                (pointerup)="onMouseUp($event)"
            ></canvas>
            <div class="actions">

                <div class="clear" [ngClass]="{'disabled': !hasSignature}" (click)="clear()">
                    <i class="fa-solid fa-eraser"></i>
                </div>
            </div>
        </div>
    </div>'
  `,
    styleUrls: ['./task-signature.component.scss']
})
export class TaskSignatureComponent implements TaskComponent, AfterViewInit {
    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();
    @ViewChild('myCanvas', { static: true }) myCanvas: ElementRef<HTMLCanvasElement>;
    public context: CanvasRenderingContext2D;

    hasSignature = false;
    hasImg = true;
    _task: InterpretorTaskDto;
    _so: SmartObjectDto;
    signaturePad = null;

    constructor(
        private authService: AuthService,
        private taskUtils: TaskUtilsService) {
    }

    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskSignatureDto;
        customData.objectLinked()
            .subscribe((so: SmartObjectDto) => {
                this._so = so;
            }, (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-085', err, TaskSignatureError));
            });
    }

    drawComplete() {
        this.hasSignature = true;

        const uniqueKey = UUID.UUID();
        const info: ATSignatureDto = {
            date: moment().format(),
            signatureID: uniqueKey,
            userID: this.authService.localProfil.id
        };

        const dataB64 = this.signaturePad.toDataURL(SIGNATURE_TYPE);
        const workFlowTrans: InterpretorTransferTransitionDto[] = [];
        workFlowTrans.push(this._dataTransform(info, dataB64));
        const dataTransfer = this._createDatatransfer(info, dataB64);
        if (dataTransfer) {
            workFlowTrans.push(this._createDatatransfer(info, dataB64));
        }
        const validation = this._computevalidation(workFlowTrans);
        this.partialValidate.emit({ validation, authorizationToNext: true });
    }

    onMouseDown(event) {
        this.hasImg = false;
    }

    onMouseUp(event) {
        this.drawComplete();
    }

    _computevalidation(workFlowTrans: InterpretorTransferTransitionDto[]): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: workFlowTrans
        };
        return validation;
    }

    _dataTransform(info: ATSignatureDto, dataB64): InterpretorTransferTransitionDto {
        const wf: InterpretorTransferTransitionDto = this._createActionTransfer(info, dataB64.split(',')[1]);
        return wf;
    }

    _createActionTransfer(info: ATSignatureDto, dataB64: string): InterpretorTransferTransitionDto {
        const action: WorkflowTaskActionSignDto = {
            smartObject: this._so.uuid,
            signature: dataB64,
            signatureName: SIGNATURE_NAME,
            signatureType: SIGNATURE_TYPE,
            info,
        };

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'sign',
                value: action,
            }
        };
        return transfer;
    }

    _createDatatransfer(sign: ATSignatureDto, dataB64): InterpretorTransferTransitionDto {

        const data = this._getTransitionData(this._task);
        if (!data) {
            return null;
        }

        const signature = {
            userID: sign.userID,
            date: sign.date,
            user: this.authService.localProfil.firstName + ' ' + this.authService.localProfil.lastName,
            signatureBase64: dataB64
        };

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            data,
            type: 'sysobjects',
            value: signature
        };

        return transfer;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            return null;
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }

    ngAfterViewInit() {
        this.context = this.myCanvas.nativeElement.getContext('2d');
        this.context.canvas.height = (Math.min(window.innerHeight, 500) - 200);
        this.context.canvas.width = (Math.min(window.innerWidth, 500) - 80);
        const penColor = getComputedStyle(this.myCanvas.nativeElement).getPropertyValue('--ALGOTECH-TERTIARY');
        this.signaturePad = new SignaturePad(this.myCanvas.nativeElement, { penColor });
    }

    drawStart() {
        this.hasImg = false;
    }

    clear() {
        this.hasSignature = false;
        this.hasImg = true;
        this.signaturePad.clear();
    }
}
