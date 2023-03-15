import { InterpretorTaskDto } from '../../../../../interpretor/src/dto';

export interface TaskComponent {
    task: InterpretorTaskDto;
    validate: any;
    partialValidate: any;
    handleError: any;
    showToast: any;
}
