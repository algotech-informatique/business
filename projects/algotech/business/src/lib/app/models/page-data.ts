import { SnPageWidgetDto } from "@algotech/core";

export class PageData {
    key: string;
    type: string;
    value: any;
    unloaded?: boolean;
    unloadedRelativeTo?: SnPageWidgetDto;
}
