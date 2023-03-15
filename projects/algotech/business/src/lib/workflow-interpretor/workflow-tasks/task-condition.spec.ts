import { HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, inject, TestBed } from '@angular/core/testing';
import { TaskCondition } from '../../../../interpretor/src';
import { AppTestModule } from '../test-fixtures/mock/app.test.module';
import { AuthMockService } from '../test-fixtures/mock/auth.mock.service';
import { TestUtils } from '../test-fixtures/mock/test-api-mock.utils';
import { WorkflowUtilsService } from '../workflow-utils/workflow-utils.service';

describe('TaskCondition', () => {

    let taskCondition: TaskCondition;
    let utils: TestUtils;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });
    
    beforeEach(inject([AuthMockService, WorkflowUtilsService],
        async (authService: AuthMockService, workflowUtilsService: WorkflowUtilsService) => {
            taskCondition = workflowUtilsService.createBackgroundTaskInstance('TaskCondition') as TaskCondition;

            utils = new TestUtils(authService, getTestBed().get(HttpTestingController));
            utils.signin('jbernard', '123456');
        }),
    );
            
    it('TaskCondition should return true', () => {
        expect(taskCondition.validateCondition('A', 'A', 'EQUALS')).toBe(true);
    });
});