import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'textBoolean' })
export class TextBooleanPipe implements PipeTransform {

    constructor() {}

    transform(data: string): string {
        return this._isBoolean(data) ?
            this._boolCharacter(data) :
            data;
    }

    _isBoolean(data: string): boolean {
        return (data && data.toString && (data.toString().toUpperCase() === 'TRUE') || (data.toString().toUpperCase() === 'FALSE'));
    }

    _boolCharacter(data: string): string {
        return (data.toString && data.toString().toUpperCase() === 'TRUE') ? '✔' : '✕';
    }
}
