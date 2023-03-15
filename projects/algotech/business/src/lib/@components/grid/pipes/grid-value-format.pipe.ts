import { GestionDisplaySettingsService } from '@algotech/angular';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Observable, of, zip } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ValueFormat } from '../../../../../interpretor/src';
import { SoUtilsService } from '../../../workflow-interpretor/@utils/so-utils.service';

@Pipe({
    name: 'gridValueFormat'
})

export class GridValueFormatPipe implements PipeTransform {

    constructor(
        private soUtils: SoUtilsService,
        private translate: TranslateService,
        private gestionDisplaySettings: GestionDisplaySettingsService) {
    }

    transform(format: ValueFormat, value: any, type: string, showNullValue: boolean, showMultipleValues: boolean): Observable<any> {
        if (value == null && showNullValue) {
            return of('null');
        }
        if (value === '' || value === '--' || value == null) {
            return of(value);
        }

        const array = Array.isArray(value) ? value : [value];

        if (Array.isArray(value) && !showMultipleValues) {
            return of(`${type} (${value.length})`);
        }

        if (array.length === 0) {
            return of([]);
        }

        const resolve$ = zip(
            ...array.map(item =>
                this.soUtils.typeIsSmartObject(type) ?
                    this.calculSoValue(item, type, format as string[]) :
                    of(this.calulPrimitiveValue(type, item, format as { key: string, custom?: any }))
            )
        );

        return resolve$.pipe(
            map((result: any[]) => {
                return Array.isArray(value) ? result.join(', ') : result[0];
            })
        )
    }

    calculSoValue(value: any, type: string, format: string[]) {
        return zip(
            this.gestionDisplaySettings.validateNameFromSettings(value, 'primary'),
            this.gestionDisplaySettings.validateNameFromSettings(value, 'secondary'),
        ).pipe(
            map((valuesData) => {
                return (format?.length > 0 ? (format.map((key: string) => this.soUtils.getPropertyDisplay(value, key))) : valuesData)
                    .join(' ');
            }),
            map((res: string) => {
                if (res.trim() === '') {
                    return type;
                }
                return res;
            })
        )
    }

    calulPrimitiveValue(type: string, value: any, format: { key: string, custom?: any }) {
        if (!format) {
            switch (type) {
                case 'date':
                    format = { key: 'L'};
                    break;
                case 'datetime':
                    format = { key: 'L LT'};
                    break;
                case 'time': {
                    format = { key: 'LT'};
                    break;
                }
                case 'number': {
                    format = { key: 'automatic'};
                    break;
                }
            }
        }

        switch (type) {
            case 'date':
            case 'datetime':
            case 'time': {
                return (type === 'time' ? moment(value, 'HH:mm:ss') : moment(value))
                    .format(format.key === 'custom' ? format.custom : format.key);
            }
            case 'number': {
                switch (format.key) {
                    case 'automatic':
                        return +value;
                    case 'decimal':
                        return (Math.round(+value * 100) / 100).toFixed(2);
                    case 'scientific':
                        return Number.parseFloat(value).toExponential(2);
                    case 'percentage':
                        return `${+value * 100}%`;
                    case 'monetary':
                        return `${(Math.round(+value * 100) / 100).toFixed(2)} ${format.custom ? format.custom : ''}`;
                    default:
                        return +value;
                }
            }
            case 'boolean': {
                return value ? this.translate.instant('TRUE') : this.translate.instant('FALSE');
            }
            default:
                return value;
        }
    }
}