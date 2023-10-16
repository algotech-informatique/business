import { Component, Input, OnInit, OnChanges, SimpleChanges, ComponentFactoryResolver, Type,
    ViewChild, Output, EventEmitter } from '@angular/core';
import * as Tasks from './index-tasks';
import { TaskComponent } from './task.interface';
import { TaskDirective } from './task.directive';
import { InterpretorTaskDto } from '../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../interpretor/src/dto';
import { DataService } from '@algotech-ce/angular';
import { NgComponentError } from '../../../../../interpretor/src/error/tasks-error';

@Component({
    selector: 'at-task-custom',
    styleUrls: ['./task-custom.style.scss'],
    template: `
        <div class="inner-custom">
            <ng-template task-host></ng-template>
        </div>
    `,
})
export class TaskCustomComponent implements OnInit, OnChanges {

    @Input() task: InterpretorTaskDto;
    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() handleError = new EventEmitter();
    @Output() showToast = new EventEmitter();

    @ViewChild(TaskDirective, { static: true }) taskHost: TaskDirective;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private dataService: DataService,
    ) {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.task) {
            this.loadComponent(changes.task.currentValue);
        }
    }

    taskValidate(validateDto: InterpretorValidateDto) {
        this.validate.emit(validateDto);
    }

    private loadComponent(task: InterpretorTaskDto) {
        const component = this.createTaskComponent(task);
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

        const viewContainerRef = this.taskHost.viewContainerRef;
        viewContainerRef.clear();

        const componentRef = viewContainerRef.createComponent(componentFactory);
        (<TaskComponent>componentRef.instance).validate.subscribe(($event: InterpretorValidateDto) => {
            this.validate.emit($event);
        });
        (<TaskComponent>componentRef.instance).partialValidate.subscribe(($event: InterpretorValidateDto) => {
            this.partialValidate.emit($event);
        });
        (<TaskComponent>componentRef.instance).handleError.subscribe(($event: NgComponentError) => {
            this.handleError.emit($event);
        });
        (<TaskComponent>componentRef.instance).showToast.subscribe(($event: string) => {
            this.showToast.emit($event);
        });
        (<TaskComponent>componentRef.instance).task = task;
    }

    private createTaskComponent(task: InterpretorTaskDto): Type<any> {

        return (Tasks as any)[`${task.type}Component`];
    }

}
