import { Injectable } from '@angular/core';
import { SocketModelService, SocketManager } from '@algotech-ce/angular';

@Injectable()
export class SocketSmartObjectsService extends SocketModelService {

    constructor(protected _socketManager: SocketManager) {
        super(_socketManager);
        this.event = 'event.smart-object';
        this.errorReload = true;
    }
}
