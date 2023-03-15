import { Injectable } from '@angular/core';
import { WorkflowDataDto, PairDto, WorkflowModelDto } from '@algotech/core';
import * as _ from 'lodash';
import { EnvService, AuthService } from '@algotech/angular';

interface IContext {
    login: string;
    host: string;
    datas: WorkflowDataDto[];
}

@Injectable()
export class WorkflowDebuggerService {
    private _context: IContext[] = [];

    host: string;

    constructor(private env: EnvService, private authService: AuthService) {
        this.env.environment.subscribe((e) => {
            this.host = e.API_URL;
        });
    }

    getContext() {
        let context: IContext = this._context.find((c) => c.host === this.host && c.login === this.authService.localProfil.login);
        if (!context) {
            context = {
                host: this.host,
                login: this.authService.localProfil.login,
                datas: []
            };
            this._context.push(context);
        }
        return context;
    }

    saveDatas(datas: WorkflowDataDto[]) {
        const context = this.getContext();

        context.datas.push(..._.filter(datas, (data: WorkflowDataDto) => {
            return context.datas.find((d) => d.key === data.key && d.type === data.type) === undefined;
        }));

        context.datas = _.map(context.datas, (data: WorkflowDataDto) => {
            const findData = datas.find((d) => d.key === data.key && d.type === data.type);
            if (findData) {
                return findData;
            } else {
                return data;
            }
        });

        return context.datas;
    }

    loadData(workflow: WorkflowModelDto): PairDto[] {
        const context = this.getContext();
        const inputs: PairDto[] = _.reduce(context.datas, (results, data: WorkflowDataDto) => {
            if (workflow.variables.find((v) => v.key === data.key && v.type === data.type)) {
                const input: PairDto = {
                    key: data.key,
                    value: data.value,
                };
                results.push(input);
            }
            return results;
        }, []);
        return inputs;
    }
}
