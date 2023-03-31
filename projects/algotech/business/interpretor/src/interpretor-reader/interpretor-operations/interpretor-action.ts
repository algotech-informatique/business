
import * as _ from 'lodash';
import { WorkflowTaskActionDto, SmartObjectDto, VersionDto, DocumentDto } from '@algotech-ce/core';
import { WorkflowErrorAction } from '../../error/interpretor-error';
import moment from 'moment';
import { UUID } from 'angular2-uuid';
import {
    WorkflowTaskActionSignDto, WorkflowTaskActionUploadDto, WorkflowTaskActionEditDocumentDto,
    WorkflowTaskActionDeleteDocumentsDto
} from '../../dto';


export interface ActionResult {
    smartObject?: SmartObjectDto;
    document?: DocumentDto;
}
export class InterpretorAction {

    constructor(smartObjects: SmartObjectDto[], documents: DocumentDto[]) {
        this._smartObjects = smartObjects;
        this._documents = documents;
    }

    _smartObjects: SmartObjectDto[];
    _documents: DocumentDto[];

    executeAction(action: WorkflowTaskActionDto): ActionResult {
        let actions: ActionResult[] = [
            this._ationSign(action),
            this._ationUpload(action),
            this._actionEditDocument(action),
            this._actionDeleteDocuments(action),
        ];
        actions = _.compact(actions);
        if (actions.length === 1) {
            return actions[0];
        }
        return null;
    }

    _findSo(uuid: string) {
        const findSo = this._smartObjects.find((so: SmartObjectDto) => so.uuid === uuid);
        if (!findSo) {
            throw new WorkflowErrorAction('ERR-131', `{{SMARTOBJECT}} {{NOT-FOUND}}: ${uuid}`);
        }
        return _.cloneDeep(findSo);
    }

    _findDocument(uuid: string) {
        const findDocument = this._documents.find((doc) => doc.uuid === uuid);
        if (!findDocument) {
            return null;
        }
        return _.cloneDeep(findDocument);
    }

    _ationSign(action: WorkflowTaskActionDto): ActionResult {
        if (action.actionKey === 'sign') {
            const _action: WorkflowTaskActionSignDto = action.value;
            const smartObject = this._findSo(_action.smartObject);
            smartObject.skills.atSignature = {
                date: moment().format(),
                userID: _action.info.userID,
                signatureID: _action.info.signatureID,
            };

            return { smartObject };
        }
        return null;
    }

    _ationUpload(action: WorkflowTaskActionDto): ActionResult {
        if (action.actionKey === 'upload') {
            const _action: WorkflowTaskActionUploadDto = action.value;
            if (!_action.smartObject) {
                return null;
            }
            const smartObject = this._findSo(_action.smartObject);

            let document = this._findDocument(_action.info.documentID);
            const version: VersionDto = {
                annotations: [],
                dateUpdated: moment().format(),
                fileID: null,
                reason: _action.info.reason,
                size: 0,
                userID: _action.info.userID,
                uuid: _action.info.versionID ? _action.info.versionID : UUID.UUID(),
                extendedProperties: [],
                linkedFilesID: [],
            };

            if (document) {
                document.versions.unshift(version);

                return { document };
            } else {
                const fileName = _action.fileName;
                const fileType = _action.fileType;
                const re = /(?:\.([^.]+))?$/;
                const ext = re.exec(fileName)[1] ? re.exec(fileName)[1] : fileType;
                const uuid = _action.info.documentID ? _action.info.documentID : UUID.UUID();

                document = {
                    ext,
                    name: fileName,
                    tags: _action.info.tags.split(','),
                    uuid: _action.info.documentID ? _action.info.documentID : UUID.UUID(),
                    versions: [version],
                    extendedProperties: [],
                };

                smartObject.skills.atDocument.documents.unshift(uuid);

                return { smartObject, document };
            }
        }
        return null;
    }

    _actionEditDocument(action: WorkflowTaskActionDto): ActionResult {
        if (action.actionKey === 'lock-document' || action.actionKey === 'edit-document') {
            const _action: WorkflowTaskActionEditDocumentDto = action.value;
            const document = this._findDocument(_action.edit.uuid);

            if (document) {
                if (_action.edit.name) {
                    document.name = _action.edit.name;
                }
                if (_action.edit.tags) {
                    document.tags = _action.edit.tags;
                }
                if (_action.edit.annotations) {
                    document.versions[0].annotations = _action.edit.annotations;
                }
                if (_action.edit.lockState !== undefined) { // can be assigned or null
                    document.lockState = _action.edit.lockState;
                }
                if (_action.edit.metadatas) {
                    document.metadatas = _action.edit.metadatas;
                }

                return { document };
            }
        }
        return null;
    }

    _actionDeleteDocuments(action: WorkflowTaskActionDto): ActionResult {
        if (action.actionKey === 'delete-documents') {
            const _action: WorkflowTaskActionDeleteDocumentsDto = action.value;
            const smartObject = this._findSo(_action.smartObject);

            smartObject.skills.atDocument.documents = smartObject.skills.atDocument.documents.filter((d) =>
                _action.documentsID.indexOf(d) === -1);

            return { smartObject };
        }
        return null;
    }
}
