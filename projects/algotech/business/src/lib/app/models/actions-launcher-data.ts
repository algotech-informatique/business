import { PairDto, SnPageEventPipeDto } from '@algotech/core';
import { Observable } from 'rxjs';

export class ActionsLauncherData {
    action: SnPageEventPipeDto;
    inputs: Observable<PairDto[]>;
}