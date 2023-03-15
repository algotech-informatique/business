import { EventEmitter, Component, Input, Output, OnInit } from '@angular/core';
import { InputDisplay } from '../dto/input-display.dto';
import { InputsGridService } from '../inputs-grid.service';
import * as _ from 'lodash';
import { PairDto, SmartObjectDto, WorkflowVariableModelDto } from '@algotech/core';
import { GestionDisplaySettingsService, sources } from '@algotech/angular';
import { Observable, zip } from 'rxjs';
import { InputLocation } from '../dto/input-location.dto';

@Component({
    selector: 'at-inputs-list',
    styleUrls: ['./inputs-list.component.scss'],
    templateUrl: './inputs-list.component.html'
})
export class InputsGridListComponent implements OnInit {

    @Input() variables: WorkflowVariableModelDto[];
    @Input() inputs: PairDto[] = [];

    @Output() update = new EventEmitter<InputDisplay[]>();

    inputsDisplay: InputDisplay[] = [];
    isDisabled: boolean;

    constructor(
        private gridService: InputsGridService,
        private gestionDisplaySettingsService: GestionDisplaySettingsService,
    ) {}

    ngOnInit() {
        if (this.variables.length === 0) { return; }
        this.inputsDisplay = _.reduce(this.variables, (res: InputDisplay[], variable: WorkflowVariableModelDto) => {
            if (variable.key) {
                const source = _.find(_.toPairs(sources), (s: any) => s[0] === variable.key);
                const title: string = source ? source[1].title : variable.key;
                const isObject: boolean = variable.type.startsWith('sys:') || variable.type.startsWith('so:') ||
                    variable.type.startsWith('sk:');

                const icon = [
                    { type: 'sys:comment', value: 'fa-solid fa-comment sys' },
                    { type: 'sys:schedule', value: 'fa-solid fa-calendar sys' },
                    { type: 'sys:user', value: 'fa-solid fa-user sys' },
                    { type: 'sys:location', value: 'fa-solid fa-location-dot sys' },
                    { type: 'sys:file', value: 'fa-solid fa-file sys' },
                    { type: 'sys:magnet', value: 'fa-solid fa-magnet' },
                ].find((i) => i.type === variable.type)?.value;

                const inputDisplay: InputDisplay = {
                    key: variable.key,
                    title,
                    value: variable.type === 'boolean' ? false : null,
                    type: variable.type,
                    multiple: variable.multiple,
                    isObject: isObject,
                    icon: icon ? icon : 'fa-solid fa-cube',
                    valueDisplay: null,
                };

                const input = this.inputs.find((i) => i.key === inputDisplay.key);
                if (input) {
                    this._updateValue(input.value, inputDisplay);
                }
                res.push(inputDisplay);
            }
            return res;
        }, []);

        this.update.emit(this.inputsDisplay);
        this.validateDiv('sys:file');
    }

    _updateValue(value: any, input: InputDisplay) {
        input.value = value;
        switch (input.type) {
            case 'sys:file':
                input.valueDisplay = (_.isArray(value) ? _.map(value, (file) => file.name) : [value.name]).join(', ');
                break;
            case 'sys:location':
                const location: InputLocation = input.value as InputLocation;
                input.valueDisplay = location.layerKey;
                break;
            case 'sys:user':
                input.valueDisplay = (_.isArray(value) ? _.map(value, (user) => user.firstName + ' ' +  user.lastName)
                    : [value.firstName + ' ' + value.lastName]).join(', ');
                break;
            case 'sys:schedule':
                input.valueDisplay = (_.isArray(value) ? _.map(value, (schedule) => schedule.scheduleTypeKey)
                    : [value.scheduleTypeKey]).join(', ');
                break;
            case 'sys:magnet':
                input.valueDisplay = value.appKey;
                break;
            case 'sys:query':
                input.valueDisplay = value.search;
                break;
            default:
                if (input.type.startsWith('so:') || input.type.startsWith('sk:')) {

                    const titles$: Observable<string>[] = _.isArray(value) ?
                        _.map(value, (so: SmartObjectDto) => this.gestionDisplaySettingsService.validateNameFromSettings(so, 'primary')) :
                        [this.gestionDisplaySettingsService.validateNameFromSettings(value, 'primary')];
                    zip(...titles$).subscribe((titles: string[]) => {
                        input.valueDisplay = titles.join(', ');
                    });
                } else {
                    input.value = value.length > 0 || _.isNumber(value) || _.isBoolean(value) ? value : null;
                }
        }
        this.validateDiv('sys:file');
    }

    updateValue(value: any, input: InputDisplay) {
        this._updateValue(value, input);
        this.update.emit(this.inputsDisplay);
    }

    validateDiv(type: string) {
        this.isDisabled = this.gridService.validateDiv(type, this.inputsDisplay);
    }

    onClickMore(input: InputDisplay) {

        this.gridService.searchObject(this.inputsDisplay, input.type, input.multiple,
            _.isArray(input.value) ? input.value : null).subscribe((value) => {
            if (value) {
                this.updateValue(value, input);
            }
        });
    }

    onLocationChange(event: {input, data}) {
        this.gridService.updateInput(this.inputsDisplay, event.data, 'map-location');
        this.updateValue(event.data, event.input);
    }

    onMagnetChange(event: {input, data}) {
        this.updateValue(event.data, event.input);
    }

}
