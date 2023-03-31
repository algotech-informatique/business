import { map, first, mergeMap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { Observable, of, throwError, zip, } from 'rxjs';
import {
    SmartObjectDto, WorkflowDataDto, DocumentDto, WorkflowInstanceContextDto, PairDto, WorkflowVariableModelDto, ATSkillsDto, SmartModelDto, SysFile,
} from '@algotech-ce/core';
import * as _ from 'lodash';
import { DownloadDataDto } from '../../dto';
import { InterpretorAbstract } from '../../interpretor-abstract/interpretor-abstract';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SoUtils } from '../../@utils/so-utils';
import { InterpretorSoUtils } from './interpretor-so-utils';

export class InterpretorSo {
    constructor(
        protected soUtils: SoUtils,
        protected workflowAbstract: InterpretorAbstract) {
    }

    public initializeData(input: PairDto, variable: WorkflowVariableModelDto, context: WorkflowInstanceContextDto):
        Observable<{ smartobjects: SmartObjectDto[], data: WorkflowDataDto }> {

        if (!this.soUtils.typeIsSmartObject(variable.type)) {
            return null;
        }

        // transform to array
        const values: any[] = Array.isArray(input.value) ? input.value : [input.value];

        // process
        let collect$ = [];
        try {
            collect$ = values.map((value: any) => this.initializeDataOne(value, variable, context));
        } catch (e) {
            return throwError(e);
        }

        // format
        return (collect$.length === 0 ? of([]) : zip(...collect$)).pipe(
            map((collect: any[]) => ({
                smartobjects: _.uniqBy(_.flatMapDeep(collect, 'smartobjects'), 'uuid'),
                data: {
                    key: input.key,
                    value: Array.isArray(input.value) ? _.flatMap(collect, 'value') : collect[0].value,
                    type: variable.type,
                }
            }))
        );
    }

    public downloadData(datas: WorkflowDataDto[], smartObjects: SmartObjectDto[], documents: DocumentDto[],
        smartmodels: SmartModelDto[], context?: WorkflowInstanceContextDto): Observable<DownloadDataDto> {
        const download: DownloadDataDto = {
            datas,
            smartObjects,
            documents,
            uuids: [],
        };

        for (const data of download.datas.filter((d) => this.soUtils.typeIsSmartObject(d.type))) {
            download.uuids.push(..._.isArray(data.value) ? data.value : [data.value]);
        }

        return this._execDownloadData(download, smartmodels, context).pipe(
            map(() => {
                // replace real type
                return {
                    datas: _.map(datas, (d: WorkflowDataDto) => {
                        const findSo = this.soUtils.typeIsAbstract(d.type) ?
                            InterpretorSoUtils.quickFind(download.smartObjects, context?.custom?.indexes, d.value) : null;
                        const data: WorkflowDataDto = {
                            key: d.key,
                            type: findSo ? `so:${findSo.modelKey.toLowerCase()}` : d.type,
                            value: d.value
                        };

                        return data;
                    }),
                    smartObjects: download.smartObjects,
                    documents: download.documents,
                };
            }),
        );
    }

    public downloadDocuments(datas: WorkflowDataDto[], documents: DocumentDto[], context?: WorkflowInstanceContextDto) {
        const docUuids = datas
            .filter((data) => data.type === 'sys:file')
            .reduce((results, data) => {
                results.push(...(Array.isArray(data.value) ? data.value : [data.value]).map(
                    (file: SysFile) => file.documentID
                ));
                return results;
            }, []);

        if (docUuids.length === 0) {
            return of({});
        }

        return this.workflowAbstract.getDocuments(context, docUuids).pipe(map((res) => {
            documents.push(...res);
            return {};
        }));
    }

    /** public for test */
    _execDownloadData(download: DownloadDataDto, smartmodels: SmartModelDto[], context: WorkflowInstanceContextDto): Observable<any> {
        if (download.uuids.length === 0) {
            return of({});
        }

        const smartObjects: SmartObjectDto[] = [];
        const completedSmartObjects: SmartObjectDto[] = [];
        const uuids = download.uuids
            .filter((uuid) => {
                const smartObject = InterpretorSoUtils.quickFind(download.smartObjects, context?.custom?.indexes, uuid);
                if (this.isCompleted(download, smartmodels, smartObject, context)) {
                    completedSmartObjects.push(smartObject);
                    return false;
                }

                if (smartObject) {
                    smartObjects.push(smartObject);
                }
                return true;
            }
            );

        if (uuids.length === 0) {
            return this._downloadDocuments(context, completedSmartObjects, download);
        }

        const hasAllSmartObjects = smartObjects.length === uuids.length;
        const data = hasAllSmartObjects ? { smartObjects } : { uuid: uuids };

        return this.workflowAbstract.getSubDoc(context, data, true, hasAllSmartObjects).pipe(
            mergeMap((subDoc: SmartObjectDto[]) => {
                for (const so of subDoc) {
                    if (!download.smartObjects.some((findSo) => findSo.uuid === so.uuid)) {
                        InterpretorSoUtils.pushSo(download.smartObjects, context?.custom?.indexes, so);
                    }
                }
                return this._downloadDocuments(context, [...smartObjects, ...subDoc], download);
            }),
            first()
        );
    }

    isCompleted(download: DownloadDataDto, smartmodels: SmartModelDto[], smartObject: SmartObjectDto, context: WorkflowInstanceContextDto): boolean {
        if (!smartObject) {
            return false;
        }

        const smartModel: SmartModelDto = _.find(smartmodels, (sm) => sm.key === smartObject.modelKey);
        if (!smartModel) {
            throw new Error(`smart model ${smartObject.modelKey} not found`);
        }

        const properties = smartModel.properties.filter((prop) => prop.keyType.startsWith('so:'));
        for (const prop of properties) {
            const propInstance = smartObject.properties.find((p) => p.key.toUpperCase() === prop.key.toUpperCase());
            if (propInstance) {
                const values = _.compact(prop.multiple ? propInstance.value : [propInstance.value]);
                if (values
                    .some(((uuid: string) => !InterpretorSoUtils.quickFind(download.smartObjects, context?.custom?.indexes, uuid)))) {
                    return false;
                }
            }
        }

        return true;
    }

    _downloadDocuments(context: WorkflowInstanceContextDto, smartObjects: SmartObjectDto[], download: DownloadDataDto) {
        const docUuids = smartObjects.reduce((result, smartObject) => {

            if (!smartObject.skills.atDocument || !smartObject.skills.atDocument.documents) {
                return result;
            }

            result.push(...smartObject.skills.atDocument.documents
                .filter((soDoc) => !download.documents.some((cacheDoc) => soDoc === cacheDoc.uuid))
            );

            return result;
        }, []);

        if (docUuids.length === 0) {
            return of({});
        }

        return this.workflowAbstract.getDocuments(context, docUuids).pipe(
            map((documents) => {
                download.documents.push(...documents);
                return;
            })
        )
    }

    private initializeDataOne(value: any, variable: WorkflowVariableModelDto, context: WorkflowInstanceContextDto) {
        if (_.isString(value)) {
            // value as reference
            return of({
                smartobjects: [],
                value,
            });

        }
        if (!_.isObject(value)) {
            throw new Error('failed to initialize smartobjects: value is not in a correct format');
        }

        if (this.soUtils.isSmartObject(value)) {
            // value as SmartObjectDto
            return of({
                smartobjects: [value],
                value: value.uuid,
            });
        } else {
            // value as object
            const smartmodels = context.smartmodels;
            const smartmodel = this.soUtils.typeIsAbstract(variable.type) ?
                this.soUtils.getModel(value.modelKey, smartmodels) :
                this.soUtils.getModelByType(variable.type, smartmodels);

            if (!smartmodel) {
                throw new Error('failed to initialize smartobjects: smartmodel undefined');
            }

            const mapped = this.soUtils.smartObjectMapped(smartmodel, context.smartmodels, value);
            return this.completeSmartObjects(mapped.smartobjects, mapped.objects, context).pipe(
                map(() => ({
                    smartobjects: mapped.smartobjects,
                    value: mapped.uuid,
                }))
            );
        }
    }

    private completeSmartObjects(smartObjects: SmartObjectDto[], objects: any[], context: WorkflowInstanceContextDto): Observable<any> {
        if (objects.length !== smartObjects.length) {
            throw new Error('failed to complete smartobjects: size of objects incorrect');
        }

        const res$ = smartObjects.map((smartObject) =>
            this.workflowAbstract.getSmartObject(context, smartObject.uuid).pipe(
                catchError(() => of(null)),
                map((smartObjectFromDB: SmartObjectDto) => {
                    const origin = objects.find((obj) => obj.uuid === smartObject.uuid);
                    return this.completeSmartObject(origin, smartObject, smartObjectFromDB);
                })
            )
        );
        return res$.length === 0 ? of([]) : zip(...res$);
    }

    private completeSmartObject(origin: any, smartObject: SmartObjectDto, smartObjectFromDB: SmartObjectDto) {
        // local
        smartObject.local = !smartObjectFromDB;

        // skills
        if (smartObjectFromDB) {
            smartObject.skills = smartObjectFromDB?.skills;
        }
        if (origin?.skills) {
            Object.entries(origin.skills).forEach(([key, value]) => {
                if (smartObject.skills[key]) {
                    smartObject.skills[key] = value;
                }
            });
            const errors = validateSync(plainToClass(ATSkillsDto, smartObject.skills), { whitelist: true });
            if (errors.length > 0) {
                throw new Error('skills format incorrect');
            }
        }

        return smartObject;
    }
}
