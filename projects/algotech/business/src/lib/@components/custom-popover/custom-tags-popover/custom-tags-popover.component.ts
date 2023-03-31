import { Component, EventEmitter, Output } from '@angular/core';
import { TagDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { TranslateLangDtoService } from '@algotech-ce/angular';

@Component({
    selector: 'at-custom-tags-popover',
    templateUrl: './custom-tags-popover.component.html',
    styleUrls: ['./custom-tags-popover.component.scss']
})
export class CustomTagsPopoverComponent {

    _tags: TagDto[];
    tagsDisplay: TagDto[];
    searchTag: string;

    @Output() validate = new EventEmitter();

    get tags() {
        return this._tags;
    }
    set tags(value) {
        this._tags = value;
        this.tagsDisplay = _.cloneDeep(this.tags);
    }

    constructor(
        private translateLangDtoService: TranslateLangDtoService,
    ) {
    }

    selectTag(tag: TagDto) {
        this.validate.next(tag);
    }

    filterTags() {
        this.tagsDisplay = (_.filter(this.tags, (tag: TagDto) => {
            return this.translateLangDtoService.transform(tag.displayName).toLowerCase().indexOf(this.searchTag.toLowerCase()) > -1;
        }));
    }

}
