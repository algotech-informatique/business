import { SmartObjectDto, PairDto, ATSignatureDto, GeoDto, SysFile, ZoneDto, WorkflowInstanceDto, WorkflowInstanceContextDto, FileUploadDto } from '@algotech-ce/core';
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { InterpretorTransferTransitionDto, WorkflowTaskActionLinkDocumentDto, WorkflowTaskActionSignDto } from '../dto';
import { WorkflowErrorMagnet } from '../error/interpretor-error';
import { MagnetUtils } from './magnet-utils';
import { SoUtils } from './so-utils';

const SIGNATURE_NAME = 'signature.png';
const SIGNATURE_TYPE = 'image/png';

export abstract class SkillsUtils {

    constructor(protected soUtils: SoUtils) { }

    abstract getMagnets(appKey: string, boardInstance: string, zoneKey: string,
        context?: WorkflowInstanceContextDto): Observable<SmartObjectDto[]>;

    createSkills(smartObject: SmartObjectDto, skills: PairDto[], instance: WorkflowInstanceDto)
        : Observable<InterpretorTransferTransitionDto[]> {
        let transfers: Observable<InterpretorTransferTransitionDto>[] = _.map(skills, (prop: PairDto) => {

            if (this.soUtils.isReset(prop.value)) {
                smartObject.skills[prop.key] = this.soUtils.createSkill(prop.key);
            } else {

                if (prop.key === 'atDocument' && prop.value) {
                    return this._createDocument(smartObject, prop);
                }
                if (prop.key === 'atSignature' && prop.value) {
                    return this._createSignature(smartObject, prop);
                }
                if (prop.key === 'atGeolocation' && prop.value) {
                    return this._createLocalisation(smartObject, prop);
                }
                if (prop.key === 'atTag' && prop.value) {
                    return this._createTags(smartObject, prop);
                }
                if (prop.key === 'atMagnet' && prop.value) {
                    return this._createMagnet(smartObject, prop, instance);
                }
            }
        });
        transfers = _.flatten(_.compact(transfers));
        return transfers.length === 0 ? of([]) : zip(...transfers);
    }

    //private deleted for unit testing
    _createDocument(smartObject: SmartObjectDto, prop: PairDto): Observable<InterpretorTransferTransitionDto>[] {
        if ((_.isArray(prop.value) && prop.value.length > 0 && prop.value[0] instanceof SmartObjectDto) ||
            (prop.value instanceof SmartObjectDto)) {
            smartObject.skills.atDocument.documents = _.uniq(_.flatten(_.map(_.isArray(prop.value) ? prop.value : [prop.value], val => val.skills.atDocument.documents)));

        } else {
            const files: SysFile[] = _.isArray(prop.value) ? prop.value : [prop.value];
            const cachedFiles = _.reduce(files, (results, file: SysFile) => {

                if (file?.documentID === undefined || file?.documentID === null) {
                    results.push(file)
                }
                return results;
            }, [])
            smartObject.skills.atDocument.documents.push(...
                _.reduce(files, (results, file: SysFile) => {
                    if (file?.size > 0 && file?.documentID !== undefined && file?.documentID !== null) {
                        results.push(file.documentID)
                    }
                    return results;
                }, []));
            if (cachedFiles.length > 0) {
                return _.map(cachedFiles, (file => {
                    const info: FileUploadDto = {
                        versionID: file.versionID,
                        reason: '',
                        tags: _.join([], ','),
                        userID: '',
                        metadatas: file.metadatas,
                    };

                    const action: WorkflowTaskActionLinkDocumentDto = {
                        smartObject: smartObject.uuid,
                        info
                    };

                    const transfer: InterpretorTransferTransitionDto = {
                        saveOnApi: true,
                        type: 'action',
                        value: {
                            actionKey: 'linkCachedSysFile',
                            value: action,
                        }
                    };

                    return of(transfer);
                }))
            }
        }
        return null;
    }

    private _createSignature(smartObject: SmartObjectDto, prop: PairDto): Observable<InterpretorTransferTransitionDto>[] {
        if (prop.value instanceof SmartObjectDto) {
            smartObject.skills.atSignature = prop.value.skills.atSignature;
        } else {
            const info: ATSignatureDto = {
                date: prop.value.date,
                signatureID: UUID.UUID(),
                userID: prop.value.userID
            };

            const action: WorkflowTaskActionSignDto = {
                smartObject: smartObject.uuid,
                signature: prop.value.signatureBase64.split(',')[1],
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
            return [of(transfer)];
        }
        return null;
    }

    private _createLocalisation(smartObject: SmartObjectDto, prop: PairDto) {
        if (prop.value instanceof SmartObjectDto) {
            smartObject.skills.atGeolocation = prop.value.skills.atGeolocation;
        } else {
            const geo: GeoDto = {
                uuid: UUID.UUID(),
                layerKey: prop.value.layerKey,
                geometries: [{ type: prop.value.type, coordinates: prop.value.coordinates }]
            };
            smartObject.skills.atGeolocation.geo.push(geo);
        }
        return null;
    }

    private _createTags(smartObject: SmartObjectDto, prop: PairDto) {
        if (prop.value instanceof SmartObjectDto) {
            smartObject.skills.atTag = prop.value.skills.atTag;
        } else {
            const tag: string = prop.value;
            smartObject.skills.atTag.tags.push(tag);
        }
    }

    private _createMagnet(smartObject: SmartObjectDto, prop: PairDto, instance: WorkflowInstanceDto) {
        if (prop.value instanceof SmartObjectDto) {
            smartObject.skills.atMagnet = prop.value.skills.atMagnet;
        } else {
            const utils = new MagnetUtils(this.soUtils);
            const position$ = this.getMagnets(prop.value.appKey, prop.value.boardInstance, prop.value.magnetsZoneKey,
                instance.context).pipe(
                    catchError(() => {
                        return throwError(new WorkflowErrorMagnet('ERR-150', '{{DOWNLOAD-ERROR}}'));
                    }),
                    map((res: SmartObjectDto[]) => {
                        const smartObjects = _.uniqBy([
                            ...instance.smartobjects.filter((so) => so.skills.atMagnet?.zones.some((z) =>
                                utils.predicateZone(z, prop.value.appKey, prop.value.boardInstance, prop.value.magnetsZoneKey))),
                            ...res
                        ], 'uuid');
                        return utils.magnetCalculatePosition(smartObject, smartObjects, prop,
                            instance.context.apps);
                    }
                    ));

            return position$.pipe(
                map((position) => {
                    const zone: ZoneDto = {
                        appKey: prop.value.appKey,
                        magnetsZoneKey: prop.value.magnetsZoneKey,
                        position,
                        order: prop.value.order,
                        boardInstance: prop.value.boardInstance,
                    };
                    _.remove(smartObject.skills.atMagnet.zones, (z: ZoneDto) => utils.predicateZone(z, prop.value.appKey, prop.value.boardInstance));
                    smartObject.skills.atMagnet.zones.push(zone);
                    return [];
                })
            );
        }
        return null;
    }
}
