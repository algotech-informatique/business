import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable, of, from, zip, TimeoutError, timer } from 'rxjs';
import { map, catchError, tap, mergeMap, delay } from 'rxjs/operators';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { TaskQRCodeError } from '../../../../container-error/container-error';
import { TaskComponent } from '../../task.interface';
import { TaskQRCodeReaderDto } from '../../../../dto/task-qrcode-reader.dto';
import { QRCodeReaderDto } from '../../../../dto/qrcode-reader.dto';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import { Html5QrcodeError } from 'html5-qrcode/esm/core';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Component({
    template: `
    <div class="at-spinner-container" *ngIf="showSpinner">
        <spinner></spinner>
    </div>
    <div class="content">
        <div id="reader"></div>
    </div>`,
    styleUrls: ['./task-qrcode-reader.component.scss'],
})
export class TaskQRCodeReaderComponent implements TaskComponent, OnDestroy {
    _task: InterpretorTaskDto;
    _subscriber;

    showSpinner = true;
    scan = null;
    attempt = 0;

    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = (this._task.custom as TaskQRCodeReaderDto);
        this._subscriber = zip(customData.timeoutSeconds()).pipe(            
            mergeMap((values: any[]) => {
                const timeoutValue = values[0];
                return this.getQRScan(timeoutValue);
            }),
            mergeMap((qr: QRCodeReaderDto) => {
                return this.constructionReturn(qr, this._task);
            })
        ).subscribe((v: InterpretorValidateDto) => {
            this.validate.emit(v);
        }, (err) => {
            this.handleError.emit(this.taskUtils.handleError('ERR-066', err, TaskQRCodeError));
        });
    }
    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    constructor( private taskUtils: TaskUtilsService) {
    }

    async ngOnDestroy() {
        this._subscriber.unsubscribe();
        this.stopScan(0).subscribe();
    }

    constructionReturn(QRCode: QRCodeReaderDto, task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const transfs: InterpretorTransferTransitionDto[] = [];
        if (QRCode) {
            transfs.push(this.transferConstruction(QRCode.readerCode, task));
        } else {
            transfs.push(this.transferConstruction('', task));
        }

        const wInterpretor: InterpretorValidateDto = {
            transitionKey: 'revision',
            transfers: transfs
        };

        if (QRCode.readTimeout) {
            Object.assign(wInterpretor, { transitionKey: 'timeout' });
        }
        if (QRCode.success) {
            Object.assign(wInterpretor, { transitionKey: 'done' });
        }
        return of(wInterpretor);
    }

    transferConstruction(returnedQRCode, task: InterpretorTaskDto): InterpretorTransferTransitionDto {
        return {
            saveOnApi: true,
            data: this._getTransitionData(task),
            type: 'sysobjects',
            value: returnedQRCode
        };
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            this.handleError.emit(new TaskQRCodeError('ERR-067', '{{TASK-PARAMETERS-CORRUPTED}}'));
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }

    stopScan(ms = 500): Observable<any> {
        return timer(ms).pipe(
            mergeMap(() => {
                if (this.scan && this.scan.stop) {
                    if (this.scan.getState() === Html5QrcodeScannerState.SCANNING) {
                        return from(this.scan.stop()).pipe(
                            tap(() => this.scan = null)
                        );
                    }
                }
                return of(null);
            })
        )
    }

    getQRScan(timeoutValue: number): Observable<QRCodeReaderDto> {
        let timeout;
        let stopRecursive = false;

        return new Observable<QRCodeReaderDto>((observer) => {
            if (timeoutValue > 0) {
                timeout = setTimeout(() => {
                    observer.error(new TimeoutError());
                }, timeoutValue * 1000);
            }

            const scanOk = (decodedText) => {
                const data: QRCodeReaderDto = {
                    readerCode: decodedText,
                    success: true,
                    denied: false,
                    readTimeout: false
                };

                if (!stopRecursive) {
                    stopRecursive = true;
                    this.stopScan().subscribe(() => observer.next(data));
                }
            };

            const scanKo = (errorMesage, err: Html5QrcodeError) => {
                if (err.type !== 0 && !stopRecursive) {
                    stopRecursive = true;
                    this.stopScan().subscribe(() => observer.error(err));
                }
            }

            const retry = (err) => {
                if (this.attempt > 10) {
                    observer.error(err);
                }
                this.attempt++;
                this.stopScan().pipe(
                    delay(500),
                    mergeMap(() => this.getQRScan(timeoutValue))
                ).subscribe((retryRes) => {
                    observer.next(retryRes);
                }, (retryErr) => {
                    observer.error(retryErr);
                })
            };

            const config = { fps: 10, qrbox: 150 };

            this.scan = new Html5Qrcode(
                'reader'
            );

            this.scan.start({ facingMode: 'environment' }, config, scanOk, scanKo)
                .then(() => {
                    this.showSpinner = false;
                }).catch((err) => {
                    // retry
                    retry(err);
                });
        }).pipe(
            catchError((err) => {
                const rCode: QRCodeReaderDto = {
                    readerCode: '',
                    readTimeout: err instanceof TimeoutError,
                    success: false,
                    denied: !(err instanceof TimeoutError),
                    error: err
                };
                return this.stopScan().pipe(map(() => rCode));
            }),
            tap(() => {
                if (timeout) {
                    clearTimeout(timeout);
                }
            }),
        );
    }
}
