import { WorkflowInstanceDto } from '@algotech/core';

type TypeFinisherDisplayMode = 'toast' | 'popup' | 'nothing';
type TypeFinisherOutputTrigger = 'end-wf' | 'end-op';
export type TypeFinisherType = 'success' | 'information' | 'warning' | 'error';
export class InterpretorFinisherDto {

    static DEFAULT_SAVE = true;
    static DEFAULT_DISPLAY_MODE: TypeFinisherDisplayMode = 'toast';
    static DEFAULT_OUTPUT_TRIGGER: TypeFinisherOutputTrigger = 'end-op';
    static DEFAULT_MESSAGE = '';
    static DEFAULT_TIMEOUT = 2000;
    static DEFAULT_TYPE: TypeFinisherType = 'success';


    constructor(instance: WorkflowInstanceDto) {
        this.instance = instance;
        this.save = InterpretorFinisherDto.DEFAULT_SAVE;
        this.displayMode = InterpretorFinisherDto.DEFAULT_DISPLAY_MODE;
        this.message = InterpretorFinisherDto.DEFAULT_MESSAGE;
        this.outputTrigger = InterpretorFinisherDto.DEFAULT_OUTPUT_TRIGGER;
        this.timeout = InterpretorFinisherDto.DEFAULT_TIMEOUT;
        this.type = InterpretorFinisherDto.DEFAULT_TYPE;
    }

    save: boolean;
    displayMode: TypeFinisherDisplayMode;
    message: string;
    outputTrigger: TypeFinisherOutputTrigger;
    timeout: number;
    type: TypeFinisherType;

    public instance: WorkflowInstanceDto;
}
