import { Component, Input, OnInit } from '@angular/core';
import { WorkflowInstanceDto } from '@algotech/core';
import * as _ from 'lodash';
import moment from 'moment';
import { NetworkService } from '@algotech/angular';
import { WorkflowSyncService } from './workflow-sync.service';
import { ToastService } from '../@services/toast.service';


@Component({
    selector: 'at-workflow-sync',
    styleUrls: ['./workflow-sync.component.scss'],
    templateUrl: './workflow-sync.component.html'
})
export class WorkflowSyncComponent implements OnInit {

    instances;
    subscriber;
    values;
    @Input() title: string;


    constructor(
        private toastService: ToastService,
        public networkService: NetworkService,
        public workflowSyncService: WorkflowSyncService) {
    }

    ngOnInit() {
        this._refreshInstances();
    }

    _refreshInstances() {
        this.workflowSyncService.getInstances().subscribe(
            (wfis: WorkflowInstanceDto[]) => {
                this.instances = _.reverse(
                    _.map(wfis, (wfi: WorkflowInstanceDto) => {
                        return {
                            uuid: wfi.uuid,
                            displayName: wfi.workflowModel.displayName,
                            values: [{
                                key: 'SYNC.STARTDATE',
                                value: this.getValue('date', wfi.createdDate),
                            }, {
                                key: 'SYNC.FINISHDATE',
                                value: this.getValue('date', wfi.finishDate),
                            }]
                        };
                    })
                );
            });
    }

    synchronize() {
        this.workflowSyncService.synchronize(
            (err) => {
                this.toastService.fail(err.message);
            },
            (instances: WorkflowInstanceDto[]) => {
                for (const instance of instances) {
                    const findIndex = _.findIndex(this.instances, (wfi) => wfi.uuid === instance.uuid);
                    if (findIndex > -1) {
                        this.instances.splice(findIndex, 1);
                    }
                }
            }
        );
    }

    getValue(valType: string, val: string): string {
        return val && val !== '' && valType === 'date' ? moment(val).format('LLL') : val;
    }
}
