import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto, InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { zip, of } from 'rxjs';
import { TaskDocumentSelectError } from '../../../../container-error/container-error';
import * as _ from 'lodash';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';

import { TaskDocumentSelectDto } from '../../../../dto/task-document-select.dto';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { DocumentDto, SysFile } from '@algotech-ce/core';
import { LinkDocument } from '../../../../../dto/link-document/link-document.dto';
import { LinkDocumentDisplay } from '../../../../../dto/link-document/link-document-display.dto';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Component({
    templateUrl: './task-document-select.component.html',
    styleUrls: ['./task-document-select.style.scss']
})
export class TaskDocumentSelectComponent implements TaskComponent {

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    searchVisible = true;
    documents = [];

    listVersions: SysFile[] = [];
    elements: LinkDocument[] = [];
    elementsListed: LinkDocument[] = [];
    cart: LinkDocument[] = [];

    searchValue = '';
    mode: 'check' | 'cart' = 'cart';

    cartView = false;
    multipleSelection = false;

    pageDefaultSize = 10;
    page = 0;
    moreDataToLoad = true;

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskDocumentSelectDto;
        zip(
            customData.search(),
            customData.documents ? customData.documents() : of(null),
            customData.multiple ? customData.multiple() : of(false)
        ).
            subscribe((values: any[]) => {
                this.searchVisible = values[0];
                this.documents = _.isArray(values[1]) ? values[1] : [values[1]];
                this.multipleSelection = values[2];
                this.mode = (this.multipleSelection) ? 'cart' : 'check';

                this.onLoad();
            },
                (err) => { this.handleError.emit(this.taskUtils.handleError('ERR-095', err, TaskDocumentSelectError)); });
    }

    constructor(
        private soUtils: SoUtilsService,
        private soUtilsService: SoUtilsService,
        private ref: ChangeDetectorRef,
        private taskUtils: TaskUtilsService
    ) { }

    onLoad() {
        this.listVersions = this.soUtils.transformListObject(this.documents, this._task.instance.documents);
        this.elements = this.loadListAssets();

        this.elementsListed = _.clone(this.elements);
        if (this.elementsListed.length < this.pageDefaultSize) {
            this.moreDataToLoad = false;
        }

        // transfer not required
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: [],
        };
        this.partialValidate.emit({ validation, authorizationToNext: false });
    }

    loadListAssets(): LinkDocument[] {

        return _.map(this.listVersions, (version: SysFile) => {
            const display: LinkDocumentDisplay = {
                primary: version.name,
                color: '#757575',
                icon: '<i class="fa-solid fa-file"></i>',
            };
            const docD: LinkDocument = {
                uuid: version.documentID,
                display: display,
                file: version,
                smartObjects: null,
                linkedObjects: null,
                checked: false,
                deletable: false,
            };
            return docD;
        });
    }

    filterElements() {
        this.cartView = false;
        this.page = 0;
        this.elementsListed = this.elements.filter((view: LinkDocument) => {
            return view.file.name.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1;
        });
    }

    cartClick() {
        this.cartView = !this.cartView;
        this.ref.detectChanges();
        const content = document.querySelector('.at-list-content');
        if (content) {
            content.scrollTop = 0;
        }
    }

    onDelete(ele: LinkDocument) {
        const index = _.findIndex(this.cart, (b: LinkDocument) => b.uuid === ele.uuid);
        const findElt = _.find(this.elementsListed, (e: LinkDocument) => e.uuid === ele.uuid);

        if (index > -1) {
            this.cart.splice(index, 1);
        }

        if (findElt) {
            findElt.deletable = false;
        }

        const items = _.map(this.cart, (c: LinkDocument) => c.file);
        this.buildValidate({ value: items, valid: items.length > 0 });
    }

    onSelect(ele: LinkDocument) {
        if (this.multipleSelection) {
            switch (this.mode) {
                case 'check':
                    ele.checked = !ele.checked;
                    const itemsChecked = _.map(this.elementsListed.filter((e) => e.checked), (e: LinkDocument) => e.file);
                    this.buildValidate({ value: itemsChecked, valid: itemsChecked.length > 0 });
                    break;
                case 'cart':
                    ele.deletable = true;
                    this.cart.push(ele);
                    const items = _.map(this.cart, (b: LinkDocument) => b.file);
                    this.buildValidate({ value: items, valid: items.length > 0 });
                    break;
            }
        } else {
            this.buildValidate({ value: ele.file, valid: true });
        }
    }

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
        const elements: DocumentDto[] | SysFile[] = _.isArray(event.value) ? event.value : [event.value];
        const files = this.validateDocs(elements);
        const transfers: InterpretorTransferTransitionDto[] = [];

        if (this._getTransitionData(this._task)) {
            const data = this._getTransitionData(this._task);
            const transfer: InterpretorTransferTransitionDto = {
                saveOnApi: false,
                data: data,
                type: 'sysobjects',
                value: this.multipleSelection ? files : (files.length > 0 ? files[0] : null),
            };
            transfers.push(transfer);
        }
        return transfers;
    }

    validateDocs(datas: DocumentDto[] | SysFile[]): SysFile[] {
        if (datas[0] instanceof DocumentDto) {
            return this.getSysFiles(datas as DocumentDto[]);
        } else {
            return datas as SysFile[];
        }
    }

    getSysFiles(docs: DocumentDto[]): SysFile[] {
        return _.map(docs, (doc: DocumentDto) => {
            return this.soUtilsService.skToSysFile(doc);
        });
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            this.handleError.emit(new TaskDocumentSelectError('ERR-096', '{{TASK-PARAMETERS-CORRUPTED}}'));
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
