import { WorkflowSoService } from './workflow-so.service';
import { TestUtils } from '../../test-fixtures/mock/test-api-mock.utils';
import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { SettingsDataService, DataService } from '@algotech/angular';
import {
    fixtSOEquipmentFromAPI, fixtSOUserApi, fixtSODocumentApi, fixtObjectEquipment, fixtObjectUser,
    fixtObjectUserToSo, fixtObjectEquipmentToSo, fixtObjectDocumentToSo, fixtObjectDocument, fixtSODocument_02, fixtSODocument_01
} from '../../test-fixtures/smart-objects';
import { fixtSmartModels } from '../../test-fixtures/smart-models';
import { fixtGlists } from '../../test-fixtures/genericlists';
import { DownloadDataDto } from '../../../../../interpretor/src/dto';
import { Storage } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { InterpretorSoUtils } from '../../../../../interpretor/src';
import { PairDto, SmartObjectDto } from '@algotech/core';
import { WorkflowInputMockBuilder } from '../../test-fixtures/mock/workflow-input-mock-builder';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthMockService } from '../../test-fixtures/mock/auth.mock.service';
import { AppTestModule } from '../../test-fixtures/mock/app.test.module';
import * as _ from 'lodash';

describe('WorkflowSoService', () => {

    let workflowSoService: WorkflowSoService;
    let utils: TestUtils;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([AuthMockService, DataService, SettingsDataService, WorkflowSoService],
        async (
            authService: AuthMockService,
            dataService: DataService,
            settingsDataService: SettingsDataService,
            _workflowSoService: WorkflowSoService) => {

            dataService.storage = new Storage({
                name: '__workflowTest',
                storeName: 'keyvaluepairs',
                driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
            });
            await dataService.storage.create();

            settingsDataService.smartmodels = fixtSmartModels;
            settingsDataService.glists = fixtGlists;

            workflowSoService = _workflowSoService;

            utils = new TestUtils(authService, getTestBed().get(HttpTestingController));
            utils.signin('jbernard', '123456');
        }));


    it(`${WorkflowSoService.prototype.initializeData.name} : should return null when input is typed string`, () => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput('Hello World');
        const variable = WorkflowInputMockBuilder.getVariable('string');

        // test
        expect(workflowSoService.initializeData(input, variable, utils.getContext())).toBeNull();
    })

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid) and no SmartObjects when input is value as reference of SmartObject`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput('3289180b-1dfe-434f-a561-972d678a4095');
        const variable = WorkflowInputMockBuilder.getVariable();
        const result = WorkflowInputMockBuilder.getResult([], '3289180b-1dfe-434f-a561-972d678a4095');

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );
    })

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid) and one SmartObject when input is value as SmartObjectDto`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput(fixtSOEquipmentFromAPI);
        const variable = WorkflowInputMockBuilder.getVariable();
        const result = WorkflowInputMockBuilder.getResult([fixtSOEquipmentFromAPI], fixtSOEquipmentFromAPI.uuid);

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );
    })

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid array) and 2 SmartObjects when input is value as array of SmartObjectDto`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput([fixtSODocument_01, fixtSODocument_02]);
        const variable = WorkflowInputMockBuilder.getVariable('so:DOCUMENT', true);
        const result = WorkflowInputMockBuilder.getResult([fixtSODocument_01, fixtSODocument_02],
            [fixtSODocument_01.uuid, fixtSODocument_02.uuid], 'so:DOCUMENT');

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );
    })

    it(`${WorkflowSoService.prototype.initializeData.name} : should throw error when input is incorrect format value`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput(55);
        const variable = WorkflowInputMockBuilder.getVariable();

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).pipe(
            catchError(() => of(true))
        ).subscribe(
            (res) => {
                expect(res).toBeTrue();
                done();
            });
    })

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid) and one SmartObject (automic mapped) when input is value as object`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput(fixtObjectUser);
        const variable = WorkflowInputMockBuilder.getVariable('so:USER');
        const result = WorkflowInputMockBuilder.getResult([fixtObjectUserToSo], fixtObjectUserToSo.uuid, 'so:USER');

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom(result.smartobjects);
        utils.verify();
    })

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid array) with 2 SmartObjects (automic mapped) when input is typed SmartObject (abstract) with value as array of diffent type of object`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput(
            [
                WorkflowInputMockBuilder.assignModelKey(fixtObjectUser, 'USER'),
                WorkflowInputMockBuilder.assignModelKey(fixtObjectDocument, 'DOCUMENT')
            ]);
        const variable = WorkflowInputMockBuilder.getVariable('so:*', true);
        const result = WorkflowInputMockBuilder.getResult([fixtObjectUserToSo, fixtObjectDocumentToSo],
            [fixtObjectUserToSo.uuid, fixtObjectDocument.uuid], 'so:*');

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom(result.smartobjects);
        utils.verify();
    })

    it(`${WorkflowSoService.prototype.initializeData.name} : should throw error when input is typed SmartObject (abstract) with value as object with undefined type`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput(fixtObjectUser);
        const variable = WorkflowInputMockBuilder.getVariable('sk:atDocument');

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).pipe(
            catchError(() => of(true))
        ).subscribe(
            (res) => {
                expect(res).toBeTrue();
                done();
            });
    })

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid) and one SmartObject with origin skills when input has no defined skills`, (done) => {
        // prepare data
        const skills = {
            atDocument: {
                documents: ['62f0f79f-7c9e-4c6c-8aab-0c45d3968cee']
            }
        };
        const input: PairDto = WorkflowInputMockBuilder.getInput(fixtObjectUser);
        const variable = WorkflowInputMockBuilder.getVariable('so:USER');
        const smartObjectWithSkills = WorkflowInputMockBuilder.assignSkill(fixtObjectUserToSo, skills);
        const result = WorkflowInputMockBuilder.getResult([smartObjectWithSkills], fixtObjectUserToSo.uuid, 'so:USER');

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                // so have to contains origin skills
                expect(res).toEqual(result);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom([smartObjectWithSkills]);
        utils.verify();
    });

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid) and one SmartObject mapped with input skills when this one has defined skills`, (done) => {
        // prepare data
        const skills = {
            atDocument: {
                documents: ['62f0f79f-7c9e-4c6c-8aab-0c45d3968cee']
            }
        };
        const input: PairDto = WorkflowInputMockBuilder.getInput(WorkflowInputMockBuilder.assignSkill(fixtObjectUser, skills));
        const variable = WorkflowInputMockBuilder.getVariable('so:USER');
        const result = WorkflowInputMockBuilder.getResult(
            [WorkflowInputMockBuilder.assignSkill(fixtObjectUserToSo, skills)],
            fixtObjectUserToSo.uuid, 'so:USER'
        );

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                // so have to contains object skills
                expect(res).toEqual(result);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom([fixtObjectUserToSo]);
        utils.verify();
    });

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid) and one SmartObject with the merge of original and input skills when the both of them defined skills`, (done) => {
        // prepare data
        const skills1 = {
            atDocument: {
                documents: ['62f0f79f-7c9e-4c6c-8aab-0c45d3968cee']
            }
        };

        const skills2 = {
            atDocument: {
                documents: ['76d3a88b-4005-4707-9b65-2c7e5ffde3d8']
            }
        };
        const input: PairDto = WorkflowInputMockBuilder.getInput(WorkflowInputMockBuilder.assignSkill(fixtObjectUser, skills1));
        const variable = WorkflowInputMockBuilder.getVariable('so:USER');
        const result = WorkflowInputMockBuilder.getResult(
            [WorkflowInputMockBuilder.assignSkill(fixtObjectUserToSo, skills1)],
            fixtObjectUserToSo.uuid, 'so:USER'
        );

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                // so have to contains object skills
                expect(res).toEqual(result);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom([WorkflowInputMockBuilder.assignSkill(fixtObjectUserToSo, skills2)]);
        utils.verify();
    });


    it(`${WorkflowSoService.prototype.initializeData.name} : should throw error when input as object with incorrect skills`, (done) => {
        // prepare data
        const skills = {
            atDocument: {
                documentsssss: ['62f0f79f-7c9e-4c6c-8aab-0c45d3968cee']
            }
        };
        const input: PairDto = WorkflowInputMockBuilder.getInput(WorkflowInputMockBuilder.assignSkill(fixtObjectUser, skills));
        const variable = WorkflowInputMockBuilder.getVariable('so:USER');

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).pipe(
            catchError(() => of(true))
        ).subscribe(
            (res) => {
                expect(res).toBeTrue();
                done();
            });

        // api
        utils.downloadSmartObjectsFrom([fixtObjectUserToSo]);
        utils.verify();
    });

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid) and 3 SmartObjects when input is value as deep object`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput(fixtObjectEquipment);
        const variable = WorkflowInputMockBuilder.getVariable('so:EQUIPMENT');
        const result = WorkflowInputMockBuilder.getResult([
            fixtObjectUserToSo,
            fixtObjectDocumentToSo,
            fixtObjectEquipmentToSo
        ], fixtObjectEquipmentToSo.uuid, 'so:EQUIPMENT');

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom(result.smartobjects);
        utils.verify();
    })

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data with 1 local SmartObject and 2 not local when input is deep object (new one at root level and existing objects in sub property)`, (done) => {
        // prepare data
        const object = WorkflowInputMockBuilder.changeUuid(fixtObjectEquipment);
        const input: PairDto = WorkflowInputMockBuilder.getInput(object);
        const variable = WorkflowInputMockBuilder.getVariable();

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                expect(res.smartobjects.filter((so) => so.local).length).toBe(1);
                expect(res.smartobjects.filter((so) => !so.local).length).toBe(2);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom([
            fixtObjectUserToSo,
            fixtObjectDocumentToSo,
        ], [
            WorkflowInputMockBuilder.assign(fixtObjectEquipmentToSo, { uuid: object.uuid })
        ]);
        utils.verify();
    });

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid) with 1 SmartObject when input is value as object with property like reference to SmartObject`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput(WorkflowInputMockBuilder.breakComposition(fixtObjectDocument, 'USER'));
        const variable = WorkflowInputMockBuilder.getVariable('so:DOCUMENT');
        const result = WorkflowInputMockBuilder.getResult([fixtObjectDocumentToSo], fixtObjectDocumentToSo.uuid, 'so:DOCUMENT');

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom(result.smartobjects);
        utils.verify();
    });

    it(`${WorkflowSoService.prototype.initializeData.name} : should return data (uuid) with 1 SmartObject when input is value as object with property like reference to SmartObjects`, (done) => {
        // prepare data
        const input: PairDto = WorkflowInputMockBuilder.getInput(WorkflowInputMockBuilder.breakComposition(fixtObjectEquipment, 'DOCUMENTS'));
        const variable = WorkflowInputMockBuilder.getVariable();
        const result = WorkflowInputMockBuilder.getResult([fixtObjectEquipmentToSo], fixtObjectEquipmentToSo.uuid);

        // test
        workflowSoService.initializeData(input, variable, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom(result.smartobjects);
        utils.verify();
    });

    it(`${WorkflowSoService.prototype.downloadData.name} - check complete smart objects/models`, (done) => {

        const data = [{
            key: 'equipment',
            type: 'so:equipment',
            value: fixtSOEquipmentFromAPI.uuid
        }];
        const smartobjects = [fixtSOEquipmentFromAPI];
        const documents = [];

        workflowSoService.downloadData(data, smartobjects, documents, utils.getContext().smartmodels, utils.getContext()).subscribe(
            (res: DownloadDataDto) => {

                expect(res.smartObjects.find((so) => so.uuid === fixtSOEquipmentFromAPI.uuid)).not.toBeUndefined();
                expect(res.smartObjects.find((so) => so.uuid === fixtSODocumentApi.uuid)).not.toBeUndefined();
                expect(res.smartObjects.find((so) => so.uuid === fixtSOUserApi.uuid)).not.toBeUndefined();

                done();
            }, () => {
                done();
            }
        );

        utils.downloadSmartObjects();
        utils.verify();
    });

    it(`${InterpretorSoUtils.isSmartObject.name} should return true when value instance of SmartObject`, () => {
        expect(InterpretorSoUtils.isSmartObject(new SmartObjectDto())).toBeTrue();
        expect(InterpretorSoUtils.isSmartObject([new SmartObjectDto(), new SmartObjectDto()])).toBeTrue();
    })

    it(`${InterpretorSoUtils.isSmartObject.name} should return false when value is not instance of SmartObject`, () => {
        expect(InterpretorSoUtils.isSmartObject(fixtSOEquipmentFromAPI)).toBeFalse();
        expect(InterpretorSoUtils.isSmartObject([fixtSOEquipmentFromAPI])).toBeFalse();
        expect(InterpretorSoUtils.isSmartObject(1)).toBeFalse();
        expect(InterpretorSoUtils.isSmartObject([1])).toBeFalse();
    })

    it(`${InterpretorSoUtils.smartObjectToClass.name} should return instanceof SmartObject`, () => {
        // prepare data
        const instance = InterpretorSoUtils.smartObjectToClass(fixtSOEquipmentFromAPI);

        // test
        expect(instance instanceof SmartObjectDto).toBeTrue();
        expect(instance.properties).toBe(fixtSOEquipmentFromAPI.properties);
        expect(instance.skills).toBe(fixtSOEquipmentFromAPI.skills);
        expect(instance.modelKey).toBe(fixtSOEquipmentFromAPI.modelKey);
    })

    it(`${InterpretorSoUtils.smartObjectToClass.name} should return instanceof SmartObject (array)`, () => {
        // prepare data
        const instance = InterpretorSoUtils.smartObjectToClass([fixtSOEquipmentFromAPI]);

        // test
        expect(instance[0] instanceof SmartObjectDto).toBeTrue();
    })

    it(`${InterpretorSoUtils.smartObjectToClass.name} should return clone of instanceof SmartObject`, () => {
        // prepare data
        const instance = InterpretorSoUtils.smartObjectToClass(fixtSOEquipmentFromAPI, true);

        // test
        expect(instance.properties).not.toBe(fixtSOEquipmentFromAPI.properties);
        expect(instance.skills).not.toBe(fixtSOEquipmentFromAPI.skills);
        expect(instance.properties).toEqual(fixtSOEquipmentFromAPI.properties);
        expect(instance.skills).toEqual(fixtSOEquipmentFromAPI.skills);
    })

    it(`${InterpretorSoUtils.pushSo.name} should push smartobject`, () => {
        // prepare data
        const smartObjects = [];
        const smartObject = fixtSOEquipmentFromAPI;
        const indexes = {};
        InterpretorSoUtils.pushSo(smartObjects, indexes, smartObject);

        const indexesAfter = {};
        indexesAfter[fixtSOEquipmentFromAPI.uuid] = 0;

        // test
        expect(indexes).toEqual(indexesAfter);
        expect(smartObjects).toEqual([InterpretorSoUtils.smartObjectToClass(fixtSOEquipmentFromAPI)]);
    })

    it(`${InterpretorSoUtils.pushSo.name} should remove smartobject`, () => {
        // prepare data
        const smartObjects = [
            InterpretorSoUtils.smartObjectToClass(fixtSODocumentApi),
            InterpretorSoUtils.smartObjectToClass(fixtSOEquipmentFromAPI)
        ];
        const indexes = {};
        indexes[fixtSODocumentApi.uuid] = 0;
        indexes[fixtSOEquipmentFromAPI.uuid] = 1;
        InterpretorSoUtils.removeSo(smartObjects, indexes, fixtSODocumentApi.uuid);

        const indexesAfter = {};
        indexesAfter[fixtSOEquipmentFromAPI.uuid] = 0;

        // test
        expect(indexes).toEqual(indexesAfter);
        expect(smartObjects).toEqual([InterpretorSoUtils.smartObjectToClass(fixtSOEquipmentFromAPI)]);
    })

    it(`${InterpretorSoUtils.quickFind.name} should return null`, () => {
        expect(InterpretorSoUtils.quickFind([], {}, fixtSODocumentApi.uuid)).toBeNull();
    })

    it(`${InterpretorSoUtils.quickFind.name} should return undefined`, () => {
        expect(InterpretorSoUtils.quickFind([fixtSOEquipmentFromAPI], {}, fixtSODocumentApi.uuid)).toBeUndefined();
        expect(InterpretorSoUtils.quickFind([fixtSOEquipmentFromAPI], { [fixtSODocumentApi.uuid]: 0 }, fixtSODocumentApi.uuid)).toBeUndefined();
    })

    it(`${InterpretorSoUtils.quickFind.name} should return smart object`, () => {
        expect(InterpretorSoUtils.quickFind([fixtSODocumentApi], {}, fixtSODocumentApi.uuid)).toEqual(fixtSODocumentApi);
        expect(InterpretorSoUtils.quickFind([fixtSODocumentApi], { [fixtSODocumentApi.uuid]: 0 }, fixtSODocumentApi.uuid)).toEqual(fixtSODocumentApi);
        expect(InterpretorSoUtils.quickFind([fixtSODocumentApi], { [fixtSODocumentApi.uuid]: 100 }, fixtSODocumentApi.uuid)).toEqual(fixtSODocumentApi);
    })

    it(`${InterpretorSoUtils.split.name}`, () => {
        expect(InterpretorSoUtils.split('smart-object-selected.USER.NAME')).toEqual(['smart-object-selected', 'USER', 'NAME']);
        expect(InterpretorSoUtils.split('smart-object-selected')).toEqual(['smart-object-selected']);
        expect(InterpretorSoUtils.split('')).toEqual([]);
        expect(InterpretorSoUtils.split('smart-object-selected.~__extended.comment')).toEqual(['smart-object-selected', '~__extended.comment']);
        expect(InterpretorSoUtils.split('smart-object-selected.USER.~__extended.comment')).toEqual(['smart-object-selected', 'USER', '~__extended.comment']);
    })
});
