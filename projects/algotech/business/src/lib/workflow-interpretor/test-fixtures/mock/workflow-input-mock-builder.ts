import { PairDto, SmartObjectDto, WorkflowVariableModelDto } from "@algotech/core";
import { UUID } from "angular2-uuid";
import * as _ from 'lodash';
import { fixtObjectDocumentToSo, fixtObjectEquipmentToSo, fixtObjectUserToSo, fixtSOEquipmentFromAPI } from "../smart-objects";

export class WorkflowInputMockBuilder {
    static getInput(value: any, key = 'smart-object-selected'): PairDto {
        return {
            key,
            value,
        }
    }

    static getVariable(type = 'so:EQUIPMENT', multiple = false, key = 'smart-object-selected'): WorkflowVariableModelDto {
        return {
            uuid: UUID.UUID(),
            key,
            multiple,
            type,
        }
    }

    static getArrayResult(smartobjects: SmartObjectDto[], variables: WorkflowVariableModelDto[], values: any[]) {
        return {
            smartobjects,
            data: variables.map((v, index) => {
                return {
                    key: v.key,
                    value: values[index],
                    type: v.type,
                }
            }),
        };
    }

    static getResult(smartobjects: SmartObjectDto[], uuid: string | string[], type = 'so:EQUIPMENT') {
        return {
            smartobjects,
            data: {
                key: 'smart-object-selected',
                value: uuid,
                type,
            }
        }
    }

    static assignModelKey(value: any, modelKey: string) {
        return Object.assign(_.cloneDeep(value), {
            modelKey
        });
    }

    static assignSkill(value: any, skills: any) {
        const object = _.cloneDeep(value);
        if (!object.skills) {
            object.skills = {};
        }
        Object.entries(skills).forEach(([key, value]) => {
            object.skills[key] = value;
        })
        return object;
    }

    static changeUuid(value: any) {
        const copy = _.cloneDeep(value);
        copy.uuid = UUID.UUID();
        return copy;
    }

    static assign(value: SmartObjectDto, source: any) {
        return Object.assign(_.cloneDeep(value), source);
    }

    static breakComposition(value: any, key: string) {
        const copy = _.cloneDeep(value);
        copy[key] = Array.isArray(copy[key]) ? copy[key].map((v) => v.uuid) : copy[key].uuid;
        return copy;
    }
}