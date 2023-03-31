import { PairDto, SnPageEventPipeDto } from '@algotech-ce/core';
import { Observable } from 'rxjs';

export class ActionsLauncherData {
    action: SnPageEventPipeDto;
    inputs: Observable<PairDto[]>;
}