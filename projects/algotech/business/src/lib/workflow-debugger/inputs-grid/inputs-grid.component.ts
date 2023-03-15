import { Component, Input, Output, EventEmitter } from '@angular/core';
import { WorkflowModelDto, PairDto,
    SmartObjectDto, WorkflowDataDto } from '@algotech/core';
import * as _ from 'lodash';
import { InputDisplay } from './dto/input-display.dto';

@Component({
    selector: 'at-inputs-grid',
    styleUrls: ['./inputs-grid.component.scss'],
    templateUrl: './inputs-grid.component.html'
})
export class InputsGridComponent {

    @Input() workflow: WorkflowModelDto;
    @Input() inputs: PairDto[] = [];
    @Output() start = new EventEmitter<PairDto[]>();

    canStartWorkflow = false;
    inputsDisplay:  InputDisplay[] = [];

    constructor() { }

    onUpdateValue(inputsDisplay: InputDisplay[]) {
        this.inputsDisplay = inputsDisplay;
    }

    emitInputs() {
        const datas: WorkflowDataDto[] = _.reduce(this.inputsDisplay, (results, input: InputDisplay) => {
            const variable = this.workflow.variables.find((v) => v.key === input.key);
            if (variable && input.value != null) {
                const data: WorkflowDataDto = {
                    key: input.key,
                    value: input.value,
                    type: variable.type,
                };
                results.push(data);
            }
            return results;
        }, []);
        const event = new CustomEvent('start', { detail: datas });
        window.parent.document.dispatchEvent(event);
    }

    startWorkflow() {
        this.emitInputs();
        const variables: PairDto[] = _.compact(_.map(this.inputsDisplay, (input: InputDisplay) => {
            if (input.value == null) {
                return null;
            }
            if (input.type.startsWith('so:') || input.type.startsWith('sk:')) {
                input.value = _.isArray(input.value) ?
                    _.map(input.value, (value: SmartObjectDto) => value.uuid) :
                    input.value.uuid;
            }
            return {
                key: input.key,
                value: input.value,
            };
        }));
        this.start.emit(variables);
    }
}
