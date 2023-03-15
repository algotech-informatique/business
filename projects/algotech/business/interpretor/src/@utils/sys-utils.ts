import {
    WorkflowModelDto, ScheduleDto, UserDto, WorkflowProfilModelDto,
    WorkflowVariableModelDto, GeoDto, DocumentDto, ZoneDto
} from '@algotech/core';
import * as _ from 'lodash';

export class SysUtils {

    public getFilteredWorkflow(wf: WorkflowModelDto, preferedLang): WorkflowModelDto {
        return Object.assign({}, wf, {
            displayName: _.find(wf.displayName, (name) => name.lang === preferedLang).value,
            description: _.find(wf.description, (desc) => desc.lang === preferedLang).value
        });
    }

    public transform(object: Object, type: string, preferedLang?: string, accessToken = ''): any {
        try {
            switch (type) {
                case 'sys:location':
                    const loc = object as GeoDto;
                    const geo = loc.geometries.length >= 1 ? loc.geometries[0] : null;
                    return {
                        layerKey: loc.layerKey,
                        type: geo ? geo.type : null,
                        coordinates: geo ? geo.coordinates : null,
                    };
                case 'sys:workflow':
                    const wf = object as WorkflowModelDto;
                    const displayName = _.find(wf.displayName, (name) => name.lang === preferedLang);
                    const description = _.find(wf.description, (name) => name.lang === preferedLang);
                    return {
                        uuid: wf.uuid,
                        displayName: displayName ? displayName.value : '',
                        description: description ? description.value : '',
                        iconName: wf.iconName,
                        profiles: this.getProfiles(wf.profiles),
                        variables: this.getVariables(wf.variables)
                    };
                case 'sys:schedule':
                    const sch = object as ScheduleDto;
                    return {
                        uuid: sch.uuid,
                        scheduleTypeKey: sch.scheduleTypeKey,
                        title: sch.title,
                        repetitionMode: sch.repetitionMode,
                        scheduleStatus: sch.scheduleStatus,
                        creationDate: sch.creationDate
                    };
                case 'sys:user':
                    const usr = object as UserDto;
                    return {
                        uuid: usr.uuid,
                        credentials: {
                            login: usr.username,
                            access_token: accessToken
                        },
                        email: usr.email,
                        firstName: usr.firstName,
                        lastName: usr.lastName,
                        groups: usr.groups,
                        pictureUrl: usr.pictureUrl
                    };
                case 'sys:file':
                    const doc = object as DocumentDto;
                    return {
                        documentID: doc.uuid,
                        versionID: doc.versions[0].uuid,
                        name: doc.name,
                        reason: doc.versions[0].reason,
                        ext: doc.ext,
                        size: doc.versions[0].size,
                        dateUpdated: doc.versions[0].dateUpdated,
                        user: doc.versions[0].userID,
                        tags: doc.tags,
                        metadatas: doc.metadatas,
                        annotations: doc.versions[0].annotations
                    };
                case 'sys:magnet':
                    const zone = object as ZoneDto;
                    return {
                        appKey: zone.appKey,
                        magnetsZoneKey: zone.magnetsZoneKey,
                        boardInstance: zone.boardInstance,
                        x: zone.position.x,
                        y: zone.position.y,
                        order: zone.order,
                    };
            }
        } catch {
            return object;
        }
    }

    private getProfiles(profiles: WorkflowProfilModelDto[]): any {
        return _.map(profiles, (profil: WorkflowProfilModelDto) => {
            return {
                uuid: profil.uuid,
                name: profil.name
            };
        });
    }

    private getVariables(variables: WorkflowVariableModelDto[]): any {
        return _.map(variables, (variable: WorkflowVariableModelDto) => {
            return {
                uuid: variable.uuid,
                key: variable.key,
                type: variable.type
            };
        });
    }
}
