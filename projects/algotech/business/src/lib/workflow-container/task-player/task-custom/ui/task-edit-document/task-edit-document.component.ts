import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto, WorkflowTaskActionEditDocumentDto } from '../../../../../../../interpretor/src/dto';
import { zip, of } from 'rxjs';
import { TaskEditDocumentError } from '../../../../container-error/container-error';
import * as _ from 'lodash';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { TaskEditDocumentDto } from '../../../../dto/task-edit-document.dto';
import { SmartObjectDto, FileEditDto, TagListDto, SysFile, DocumentMetadatasDto } from '@algotech/core';
import { SettingsDataService } from '@algotech/angular';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { TranslateService } from '@ngx-translate/core';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { TagsUtilsService } from '../../../../../workflow-interpretor/@utils/tags-utilis.service';
import { DocumentsMetaDatasSettingsDto } from '@algotech/core';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';


@Component({
    templateUrl: './task-edit-document.component.html',
})
export class TaskEditDocumentComponent implements TaskComponent {

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    document: SysFile;
    objectLinked: SmartObjectDto;
    ext = '';
    name = '';
    nameExists = '';
    taggable: boolean;
    tags: string[] = [];
    tagsListsBase: TagListDto[];
    tagsLists: TagListDto[];
    metadatable: boolean;
    metadatas: DocumentMetadatasDto[];
    metadatasList: DocumentsMetaDatasSettingsDto[];

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskEditDocumentDto;
        zip(
            customData.document(),
            customData.objectLinked(),
            customData.activeTag ? customData.activeTag() : of(false),
            customData.modelsTag ? customData.modelsTag() : of([]),
            customData.activeMetadata ? customData.activeMetadata() : of(false),
        ).
            subscribe((values: any[]) => {
                this.document = values[0];
                this.objectLinked = values[1];
                const allListsTags: TagListDto[] = this.settingsDataService.tags;
                this.tagsListsBase = _.filter(allListsTags, (listTag: TagListDto) => _.includes(values[3], listTag.key));
                this.taggable = values[2];
                this.metadatasList = this.settingsDataService.settings.documents.metadatas;
                this.metadatable = values[4];
                this.onLoad();
            }, (err) => { this.handleError.emit(this.taskUtils.handleError('ERR-074', err, TaskEditDocumentError)); });
    }

    constructor(
        private soUtils: SoUtilsService,
        private translate: TranslateService,
        private settingsDataService: SettingsDataService,
        private tagsUtilsService: TagsUtilsService,
        private taskUtils: TaskUtilsService
    ) { }

    onLoad() {
        this.tagsLists = this.tagsUtilsService.filterDocumentTagsLists(this.tagsListsBase, this._isImage(this.document));
        this.name = this.document.name;
        this.tags = this.document.tags;
        this.metadatas = this.document.metadatas;

        // if document name knows the extension
        if (this.name.split('.').indexOf(this.document.ext) > -1) {
            this.name = this.name.substr(0, this.name.lastIndexOf('.'));
            this.ext = `.${this.document.ext}`;
        }

        this.onValidate();
    }

    onTagChanged(tags: string[]) {
        this.tags = tags;
        this.onValidate();
    }

    onMetadataChanged(metadatas: DocumentMetadatasDto[]) {
        this.metadatas = metadatas;
        this.onValidate();
    }

    onValidate(tags?: string[]) {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: [this.transferConstruction(tags)]
        };

        this.nameExists = '';
        if (this.objectLinked.skills.atDocument && this.objectLinked.skills.atDocument.documents) {
            const documents = this.soUtils.getDocuments(this.objectLinked, this._task.instance.documents);

            if (documents.find((d) => d.name === `${this.name}${this.ext}` && d.uuid !== this.document.documentID)) {
                this.nameExists = this.translate.instant('WORKFLOW.DOCUMENT.NAME-EXIST', { name: `${this.name}${this.ext}` });
                this.partialValidate.emit({ validation: null, authorizationToNext: false });
                return;
            }
        }

        this.partialValidate.emit({ validation, authorizationToNext: this.name !== '' });
    }

    transferConstruction(tags?: string[]): InterpretorTransferTransitionDto {
        const edit: FileEditDto = {
            uuid: this.document.documentID,
            name: `${this.name}${this.ext}`,
        };
        if (tags) { edit.tags = tags; }
        if (this.metadatas) { edit.metadatas = this.metadatas; }

        const action: WorkflowTaskActionEditDocumentDto = {
            smartObject: this.objectLinked.uuid,
            edit
        };

        return {
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'edit-document',
                value: action,
            }
        };
    }

    _isImage(document: SysFile) {
        return _.indexOf(['png', 'jpg', 'jpeg', 'bmp', 'ico', 'gif', 'svg'], _.lowerCase(document.ext)) > -1;
    }

}
