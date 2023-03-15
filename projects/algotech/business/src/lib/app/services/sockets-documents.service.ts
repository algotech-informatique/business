import { Injectable } from '@angular/core';
import { SocketModelService, SocketManager } from '@algotech/angular';

@Injectable()
export class SocketDocumentsService extends SocketModelService {

    constructor(protected _socketManager: SocketManager) {
        super(_socketManager);
        this.event = 'event.document';
        this.errorReload = true;
    }
}
