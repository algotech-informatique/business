import { SmartObjectDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { SoUtils } from '../../@utils';

export class InterpretorSoUtils {
    private constructor() { }

    static quickFind(smartObjects: SmartObjectDto[], indexes: any, uuid: string) {
        if (smartObjects.length === 0) {
            return null;
        }
        if (!indexes) {
            return smartObjects.find((so) => so.uuid === uuid);
        }
        let index = indexes[uuid];
        if (index !== undefined && smartObjects[index]?.uuid === uuid) {
            return smartObjects[index];
        }

        return smartObjects.find((so) => so.uuid === uuid);
    }

    static pushSo(smartObjects: SmartObjectDto[], indexes: any, smartObject: SmartObjectDto) {
        const toClass = InterpretorSoUtils.smartObjectToClass(smartObject);
        const length = smartObjects.push(toClass);
        if (indexes) {
            indexes[toClass.uuid] = length - 1;
        }

        return toClass;
    }

    static pushSoIfNotExists(smartObjects: SmartObjectDto[], toAdd: SmartObjectDto|SmartObjectDto[], indexes: any) {
        for (const so of (Array.isArray(toAdd) ? toAdd : [toAdd]))  {
            if (!InterpretorSoUtils.quickFind(smartObjects, indexes, so.uuid)) {
                InterpretorSoUtils.pushSo(smartObjects, indexes, so);
            }
        }
    }

    static pushOrReplaceSo(smartObjects: SmartObjectDto[], toAdd: SmartObjectDto|SmartObjectDto[], indexes: any) {
        for (const so of (Array.isArray(toAdd) ? toAdd : [toAdd]))  {
            this.removeSo(smartObjects, indexes, so.uuid);
            InterpretorSoUtils.pushSo(smartObjects, indexes, so);
        }
    }

    static removeSo(smartObjects: SmartObjectDto[], indexes: any, uuid: string) {
        const length = smartObjects.length;
        _.remove(smartObjects, ((so) => so.uuid === uuid));

        // recalcul index
        if (indexes) {
            delete indexes[uuid];
            if (length !== smartObjects.length) {
                for (let i = 0; i < smartObjects.length; i++) {
                    indexes[smartObjects[i].uuid] = i;
                }
            }
        }
    }

    static isSmartObject(value: any|any[]) {
        if (Array.isArray(value)) {
            if (value.length > 0 && value[0] instanceof SmartObjectDto) {
                return true;
            }
        } else if (value instanceof SmartObjectDto) {
            return true;
        }

        return false;
    }

    static smartObjectToClass(plainSmartObject: SmartObjectDto|SmartObjectDto[], clone = false): SmartObjectDto {
        const toClass = (so: SmartObjectDto) => {
            if (!so) {
                return null;
            }
            const res = new SmartObjectDto();
    
            res.uuid = so.uuid;
            res.modelKey = so.modelKey;
            res.properties = clone ? _.cloneDeep(so.properties) : so.properties;
            res.skills = clone ? _.cloneDeep(so.skills) : so.skills;
    
            if (so.createdDate !== undefined) {
                res.createdDate = so.createdDate;
            }
            if (so.local !== undefined) {
                res.local = so.local;
            }
            if (so.updateDate !== undefined) {
                res.updateDate = so.updateDate;
            }
    
            return res;
        };
    
        if (_.isArray(plainSmartObject)) {
            return _.map(plainSmartObject, (so) => toClass(so));
        } else {
            return toClass(plainSmartObject as SmartObjectDto);
        }
    }

    static split(symbole: string) {
        const split = symbole.split('.');
        // extended property

        if (!symbole) {
            return [];
        }

        const res = [];
        while (split.length > 0) {
            if (split[0].startsWith(SoUtils.EXPAND) && split.length > 1) {
                res.push(`${split[0]}.${split[1]}`);
                split.shift();
            } else {
                res.push(split[0]);
            }
            split.shift();
        }
        return res;
    }
}