import { of, zip, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import moment from 'moment';
import { TaskBase } from './task-base';

import { InterpretorValidateDto, InterpretorTaskDto, TaskConditionDto } from '../dto';
import { TaskConditionError } from '../error/tasks-error';

export class TaskCondition extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskConditionDto);
        return zip(
            customData.conditionAValue({ formatted: true, byValue: true}),
            customData.conditionBValue ? customData.conditionBValue({ formatted: true}) : of(''),
            customData.condition ? customData.condition() : of('')
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-003', err, TaskConditionError);
            }),
            map((values: any[]) => {
                const valA: any = values[0];
                const valB: any = values[1];
                const condition = values[2];

                return {
                    transitionKey: this.validateCondition(valA, valB, condition) ? 'true' : 'false',
                    transfers: []
                };
            })
        );
    }

    validateCondition(compareA: any, compareB: any, condition: 'EQUALS' | 'CONTAINS' | 'UPPER' | 'LOWER'): boolean {

        switch (condition) {
            case 'EQUALS':
                return this.validateCompare(compareA, compareB);
            case 'CONTAINS':
                return this.validateContains(compareA, compareB);
            case 'LOWER':
                return this.validateLower(compareA, compareB);
            case 'UPPER':
                return this.validateUpper(compareA, compareB);
            default:
                return false;
        }
    }

    validateCompare(compareA: any, compareB: any): boolean {
        const jsonA: string = JSON.stringify(compareA);
        const jsonB: string = JSON.stringify(compareB);

        if (compareB === '') {
            return this.validateBoolean(compareA);
        } else {
            return (jsonA === jsonB);
        }
    }

    validateContains(compareA: any, compareB: any): boolean {
        const jsonA: string = JSON.stringify(compareA);
        const jsonB: string = JSON.stringify(compareB);

        if (compareB === '') {
            return false;
        } else {
            return (jsonA.indexOf(jsonB) > -1);
        }
    }

    validateLower(compareA: any, compareB: any): boolean {
        if (this.validateNumber(compareA) && this.validateNumber(compareB)) {
            const numberA: number = this.returnNumber(compareA);
            const numberB: number = this.returnNumber(compareB);
            return (numberA < numberB);
        } else if (this.validateDateTime(compareA) && this.validateDateTime(compareB)) {
            const dateA = this.returnDate(compareA).toISOString();
            const dateB = this.returnDate(compareB).toISOString();
            return (moment(dateA).isBefore(dateB));
        } else {
            return false;
        }
    }

    validateUpper(compareA: any, compareB: any): boolean {
        if (this.validateNumber(compareA) && this.validateNumber(compareB)) {
            const numberA: number = this.returnNumber(compareA);
            const numberB: number = this.returnNumber(compareB);
            return (numberA > numberB);
        } else if (this.validateDateTime(compareA) && this.validateDateTime(compareB)) {
            const dateA = this.returnDate(compareA).toISOString();
            const dateB = this.returnDate(compareB).toISOString();
            return (moment(dateA).isAfter(dateB));
        } else {
            return false;
        }
    }

    returnNumber(value): number {
        return +value;
    }

    returnDate(value) {
        return moment(value);
    }

    validateNumber(value): boolean {
        return !isNaN(value);
    }

    validateBoolean(value): boolean {
        switch (value) {
            case true:
            case 'true':
            case 1:
            case '1':
            case 'on':
            case 'yes':
                return true;
            default:
                return false;
        }
    }

    validateDateTime(value) {
        return (moment(value).isValid);
    }
}
