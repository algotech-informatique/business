import { HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, inject, TestBed } from '@angular/core/testing';
import { TaskMergeV2 } from '../../../../interpretor/src';
import { TestUtils } from '../test-fixtures/mock/test-api-mock.utils';
import { WorkflowUtilsService } from '../workflow-utils/workflow-utils.service';
import { fixtSmartModels } from '../test-fixtures/smart-models';
import { fixtSODocument_01, fixtSODocument_01_update, fixtSODocument_03, fixtSODocument_04, fixtSODocument_05, fixtSODocument_06, fixtSOEquipment_01,
    textMergeDocument_01, textMergeDocument_02, textMergeDocument_03 } from '../test-fixtures/smart-objects';
import { SmartObjectDto, SmartPropertyObjectDto } from '@algotech-ce/core';
import { AppTestModule } from '../test-fixtures/mock/app.test.module';
import { AuthMockService } from '../test-fixtures/mock/auth.mock.service';

describe('TaskMergeV2', () => {

    let taskMergeV2: TaskMergeV2;
    let utils: TestUtils;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([AuthMockService, WorkflowUtilsService],
        async (authService: AuthMockService, workflowUtilsService: WorkflowUtilsService) => {
            taskMergeV2 = workflowUtilsService.createBackgroundTaskInstance('TaskMergeV2') as TaskMergeV2;

            utils = new TestUtils(authService, getTestBed().get(HttpTestingController));
            utils.signin('jbernard', '123456');
        }),
    );

    it('TaskMerge validate QuerySearch should return true', () => {
        const sos = {
            modelKey: 'EQUIPMENT',
            order: [],
            filter: [
                { key: 'NAME', value: { criteria: 'equal', value: 'Equipment_01', type: 'string' }}
            ],
        };
        
        expect(taskMergeV2._querySearch(fixtSmartModels[0], [fixtSOEquipment_01], ['NAME'])).toEqual(sos);
    });

    it('TaskMerge validate QuerySearch should return false', () => {
        const sos = {
            modelKey: 'NO-EQUP',
            order: [],
            filter: [
                { key: 'NAME', value: {criteria: 'equal', value: ['Equipment_01'], type: 'string'}}
            ],
        }
        expect(taskMergeV2._querySearch(fixtSmartModels[0], [fixtSOEquipment_01], ['NAME'])).not.toEqual(sos);
    });

    it('TaskMerge validate QuerySearch (Multiple) should return true', () => {
        const sos = {
            modelKey: 'DOCUMENT',
            order: [],
            filter: [
                { key: 'NAME', value: { criteria: 'equal', value: ['Document_01', 'Document_01_update'], type: 'string' }},
                { key: 'VERSION', value: { criteria: 'equal', value: [['Version_01'], ['Version_01']], type: 'string' }},
            ],
        };
        
        expect(taskMergeV2._querySearch(fixtSmartModels[1], [fixtSODocument_01, fixtSODocument_01_update], ['NAME', 'VERSION'])).toEqual(sos);
    });

    it('TaskMerge validate QuerySearch (Multiple) should return false', () => {
        const sos = {
            modelKey: 'DOCUMENT',
            order: [],
            filter: [
                { key: 'NAME', value: { criteria: 'equal', value: ['Document_01', 'Document_01_update'], type: 'string' }},
                { key: 'VERSION', value: { criteria: 'equal', value: ['Version_01', 'Version_01'], type: 'string' }},
            ],
        };
        
        expect(taskMergeV2._querySearch(fixtSmartModels[1], [fixtSODocument_01, fixtSODocument_01_update], ['NAME'])).not.toEqual(sos);
    });

    it('TaskMerge _filtreSmartObject should return true', () => {
        const obj: SmartObjectDto = {
            modelKey: 'DOCUMENT',
            properties: [
                {
                    key: 'NAME',
                    value: 'Document_01'
                },
                {
                    key: 'VERSION',
                    value: 'VERSION_01'
                }
            ],
            skills: {}
        }
        expect(taskMergeV2._filterSmartObject(obj, [fixtSODocument_01, fixtSODocument_01_update], ['NAME'])).not.toBeNull();
    });

    it('TaskMerge _filtreSmartObject should return false', () => {
        const obj: SmartObjectDto = {
            modelKey: 'DOCUMENT',
            properties: [
                {
                    key: 'NAME',
                    value: 'Document_XX'
                },
                {
                    key: 'VERSION',
                    value: 'VERSION_01'
                }
            ],
            skills: {}
        }
        expect(taskMergeV2._filterSmartObject(obj, [fixtSODocument_01, fixtSODocument_01_update], ['NAME'])).toEqual(undefined);
    });

    it('TaskMerge _pushObject (Object Exists - Validate Version) should return true', () => {
        const properties: SmartPropertyObjectDto[] = [
            {
                key: 'NAME',
                value: 'Document_03'
            },
            {
                key: 'VERSION',
                value: ['VERSION_0XX']
            },
        ];
    
        const toMerge: SmartObjectDto[] = [];
        const soMerged = taskMergeV2._pushObject(toMerge, ['VERSION'], fixtSODocument_03, fixtSmartModels[1], properties )
        expect(soMerged.properties).toEqual(textMergeDocument_01);
    });

    it('TaskMerge _pushObject (Object Exists - Validate Version / Error Date) should return true', () => {
        const properties: SmartPropertyObjectDto[] = [
            {
                key: 'NAME',
                value: 'Document_04'
            },
            {
                key: 'VERSION',
                value: ['VERSION_0XX']
            },
            {
                key: 'DATE',
                value: 'No Correct Date'
            },
        ];
    
        const toMerge: SmartObjectDto[] = [];
        const soMerged = taskMergeV2._pushObject(toMerge, ['VERSION', 'DATE', 'STATES'], fixtSODocument_04, fixtSmartModels[1], properties )
        expect(soMerged.properties).toEqual(textMergeDocument_02);
    });

    it('TaskMerge _pushObject (Object Exists - Validate All) should return true', () => {
        const properties: SmartPropertyObjectDto[] = [
            {
                key: 'NAME',
                value: 'Document_02X'
            },
            {
                key: 'VERSION',
                value: ['VERSION_0XXA']
            },
            {
                key: 'STATES',
                value: 'created'
            },
        ];
    
        const toMerge: SmartObjectDto[] = [];
        const soMerged = taskMergeV2._pushObject(toMerge, ['NAME', 'VERSION', 'DATE', 'STATES'], fixtSODocument_05, fixtSmartModels[1], properties )
        expect(soMerged.properties).toEqual(textMergeDocument_03);
    });

    it('TaskMerge _pushObject (Object Exists - Validate All) should return false', () => {
        const properties: SmartPropertyObjectDto[] = [
            {
                key: 'NAME',
                value: 'Document_02X'
            },
            {
                key: 'VERSION',
                value: ['VERSION_0XXA']
            },
            {
                key: 'DATE',
                value: '2022-05-01T00:00:00+02:00'
            },
            {
                key: 'STATES',
                value: 'created'
            },
        ];
    
        const toMerge: SmartObjectDto[] = [];
        const soMerged = taskMergeV2._pushObject(toMerge, ['NAME', 'VERSION', 'DATE', 'STATES', 'STATE'], fixtSODocument_06, fixtSmartModels[1], properties )
        expect(soMerged.properties).not.toEqual(textMergeDocument_01);
    });
 
});