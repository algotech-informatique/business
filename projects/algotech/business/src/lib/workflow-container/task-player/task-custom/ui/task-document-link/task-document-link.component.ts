import { Component, Output, EventEmitter, Input } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { TaskDocumentLinkError } from '../../../../container-error/container-error';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { zip, of } from 'rxjs';
import { TaskDocumentLinkDto } from '../../../../dto/task-link-document-list.dto';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { SmartObjectDto, DocumentDto, SysFile } from '@algotech/core';
import * as _ from 'lodash';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

interface LinkSmartObject {
    uuid: string;
    primary: string;
    secondary: string;
}

interface LinkDocument {
    uuid: string;
    documentName: string;
    linkedObjects: LinkSmartObject[];
}

@Component({
    template: `
        <at-so-link-document
            [searchVisible]="searchVisible"
            [multipleSelection]="multipleSelection"
            [mode]="modeCart"
            [linkDocuments]="linkDocuments"
            (changeValue)="buildValidate($event)"
            (handleError)="onError($event)">
        </at-so-link-document>
    `
})
export class TaskListLinkDocComponent implements TaskComponent {

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    searchVisible = false;
    cartActive = false;
    multipleSelection = false;
    smartObjects: SmartObjectDto[] = [];

    searchValue = '';
    modeCart: 'check' | 'cart' = 'cart';
    linkedDocuments: LinkDocument[] = [];
    linkDocuments: any[];

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskDocumentLinkDto;
        zip(
            customData.items ? customData.items() : of([]),
            customData.cart(),
            customData.multipleSelection(),
            customData.search(),
        ).
            subscribe((values: any[]) => {
                this.smartObjects = _.isArray(values[0]) ? values[0] : [values[0]];
                this.cartActive = values[1];
                this.multipleSelection = values[2];
                this.searchVisible = values[3];
                this.modeCart = (this.cartActive) ? 'cart' : 'check';

            }, (err) => { this.handleError.emit(
                this.taskUtils.handleError('ERR-093', err, TaskDocumentLinkError)); });
    }

    constructor(
        private soUtilsService: SoUtilsService,
        private taskUtils: TaskUtilsService
    ) { }

    public buildValidate(event: { value: any | any[], valid: boolean }) {
        const wfTransfert: InterpretorTransferTransitionDto[] = this.constructionTransfer(event);
        const validation: InterpretorValidateDto = {
            transfers: wfTransfert,
            transitionKey: 'done'
        };

        if (this.multipleSelection) {
            this.partialValidate.emit({ validation, authorizationToNext: event.valid });
        } else {
            this.validate.emit(validation);
        }
    }

    constructionTransfer(event: { value: any | any[], valid: boolean }): InterpretorTransferTransitionDto[] {
        const docs: DocumentDto[] = _.isArray(event.value) ? event.value : [event.value];
        const transfers: InterpretorTransferTransitionDto[] = this.updateSmartObjectDocument(docs);

        if (this._getTransitionData(this._task)) {
            const data = this._getTransitionData(this._task);
            const transfer: InterpretorTransferTransitionDto = {
                saveOnApi: false,
                data: data,
                type: 'sysobjects',
                value: this.getSysFiles(docs),
            };
            transfers.push(transfer);
        }

        return transfers;
    }

    loadTransferLinkFile(smartObject: SmartObjectDto): InterpretorTransferTransitionDto {
        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'smartobjects',
            value: smartObject
        };

        return transfer;
    }

    updateSmartObjectDocument(docs: DocumentDto[]): InterpretorTransferTransitionDto[] {
        const transfers: InterpretorTransferTransitionDto[] = [];

        const objects: SmartObjectDto[] = _.cloneDeep(this.smartObjects);
        _.map(objects, (so: SmartObjectDto) => {
            _.map(docs, (doc: DocumentDto) => {
                so.skills.atDocument.documents.push(doc.uuid);
            });
            transfers.push(this.loadTransferLinkFile(so));
        });
        return transfers;
    }

    getSysFiles(docs: DocumentDto[]): SysFile[] {
        return _.map(docs, (doc: DocumentDto) => {
            return this.soUtilsService.skToSysFile(doc);
        });
    }

    onError(ev) { }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            this.handleError.emit(new TaskDocumentLinkError('ERR-094', '{{TASK-PARAMETERS-CORRUPTED}}'));
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
