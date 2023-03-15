import { EventResolver } from './event-resolver';

export interface EventData {
    key: string;
    UIEvent: Event;
    inherit?: EventResolver[];
}
