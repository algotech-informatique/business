import moment from 'moment';
import * as _ from 'lodash';
import { InterpretorMetricsKeys } from '../dto/enum';
import { InterpretorMetricsDto } from '../dto';
import { PairDto } from '@algotech-ce/core';

interface WorkflowMetricsInterface {
    key: InterpretorMetricsKeys | string,
    current: number,
    execution: number,
    cumul: number,
    running?: WorkflowMetricsInterface,
    index: number,
    childs?: WorkflowMetricsInterface[]
}

type Family = 'process' | 'tasks';
const RUNNING = 'running';

export class InterpretorMetrics {
    start(metrics: PairDto[], key: InterpretorMetricsKeys | string, family: Family = 'process') {
        if (!metrics) {
            return;
        }
        const running = this.getFamily(metrics, family)[RUNNING];
        const now = new Date().valueOf();
        const item = this.item(metrics, key, family);

        this.getFamily(metrics, family)[RUNNING] = item;

        item.index++;
        if (item.current === 0) {
            item.current = now;
        }

        // already launch (multi process)
        if (this.item(metrics, key, family).index > 1) {
            return;
        }

        // pause running process
        if (running) {
            item.running = running;
            running.cumul += now - running.current;
        }
    }

    stop(metrics: PairDto[], key: InterpretorMetricsKeys | string, family: Family = 'process') {
        if (!metrics) {
            return;
        }
        const item = this.item(metrics, key, family);

        item.index--;
        if (item.index === 0) {
            // replay running process
            this.getFamily(metrics, family)[RUNNING] = item.running;
            const now = new Date().valueOf();

            item.cumul += now - item.current;
            item.current = 0;
            item.execution++;
            if (item.running) {
                item.running.current = now;
                item.running = null;
            }
        }
    }

    stopRunning(metrics: PairDto[], family: Family) {
        if (!metrics) {
            return;
        }
        const running = this.getFamily(metrics, family)[RUNNING];
        if (!running) {
            return;
        }
        this.stop(metrics, running.key, family);
    }

    getMetrics(metrics: PairDto[], family: Family = 'process'): InterpretorMetricsDto {
        if (!metrics) {
            return;
        }
        if (!this.getFamily(metrics, family)) {
            return null;
        }

        const array = Object.entries(this.getFamily(metrics, family))
            .filter(([key, value]) => key !== RUNNING)
            .map(([key, value]) => {
                return value as WorkflowMetricsInterface;
            });

        // compose childs
        for (const item of array) {
            item.childs = array.filter((child) => {
                return item.key !== child.key && InterpretorMetricsKeys[child.key]?.toString()
                    .startsWith(InterpretorMetricsKeys[item.key]?.toString())
            });
            item.childs.sort((a, b) => b.cumul - a.cumul);
            item.cumul += _.sumBy(item.childs, 'cumul')
        }

        array.sort((a, b) => b.cumul - a.cumul);

        let time = _.sum(array.map((item) => item.cumul));

        const formatMetrics = (item, totalTime) => {
            return {
                key: InterpretorMetricsKeys[item.key] ? InterpretorMetricsKeys[item.key] : item.key,
                execution: item.execution,
                time: item.cumul,
                percent: `${((item.cumul / totalTime) * 100).toFixed(2)}%`,
                childs: item.childs.map((child) => formatMetrics(child, item.cumul))
            }
        };

        return {
            time,
            items: _.compact(array.map((item) => {
                // exclude
                if (array.some((root) => root.childs.some((child) => child.key === item.key))) {
                    return null;
                }

                return formatMetrics(item, time);
            }))
        };
    }

    private getFamily(metrics: PairDto[], family: Family) {
        const find = metrics.find((m) => m.key === family);
        if (!find) {
            const value = {};
            metrics.push({ key: family as string, value });
            return family;
        }
        return find.value;
    }

    private item(metrics: PairDto[], key: InterpretorMetricsKeys | string, family: Family): WorkflowMetricsInterface {
        const find = this.getFamily(metrics, family)[key];
        if (!find) {
            const item = {
                key,
                current: 0,
                cumul: 0,
                execution: 0,
                index: 0,
            };
            this.getFamily(metrics, family)[key] = item;
            return item;
        }
        return find;
    }
}