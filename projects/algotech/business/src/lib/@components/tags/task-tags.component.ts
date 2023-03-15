import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { TagDto, TagListDto } from '@algotech/core';
import { CustomTagsPopoverComponent } from '../custom-popover/custom-tags-popover/custom-tags-popover.component';
import { WorkflowDialogService } from '../../workflow-dialog/workflow-dialog.service';

@Component({
    selector: 'at-form-tags',
    templateUrl: './task-tags.component.html',
    styleUrls: ['./task-tags.component.scss']
})
export class TaskTagsComponent implements OnInit {

    TAGS_COUNT = 3;

    constructor(
        private workflowDialog: WorkflowDialogService,
    ) { }

    @Input() tagsLists: TagListDto[] = [];
    @Input() selectedTagsKeys: string[];
    @Output() change = new EventEmitter();
    selectedTags: TagDto[];
    tags: TagDto[];
    defaultChips = new Array(this.TAGS_COUNT);

    ngOnInit() {
        this.tags = _.flatten(_.map(this.tagsLists, (tagsList: TagListDto) => tagsList.tags));
        this.selectedTags = _.filter(this.tags, (tag: TagDto) => _.includes(this.selectedTagsKeys, tag.key));
        if (this.selectedTags.length >= this.defaultChips.length) {
            this.defaultChips = new Array(this.selectedTags.length + 1);
        }
    }

    deleteTag(ev, index: number) {
        ev.stopPropagation();
        if (this.selectedTags[index].key === this.selectedTagsKeys[index]) {
            this.selectedTags.splice(index, 1);
            this.selectedTagsKeys.splice(index, 1);
        } else {
            const deletedTag: string = this.selectedTags[index].key;
            this.selectedTags.splice(index, 1);
            const selectedIndex: number = _.findIndex(this.selectedTagsKeys, (tagKey: string) => tagKey === deletedTag);
            this.selectedTagsKeys.splice(selectedIndex, 1);
        }
        this.change.emit(this.selectedTagsKeys);
        if (this.defaultChips.length > this.TAGS_COUNT) { this.defaultChips.pop(); }
    }

    presentTagsPopover(ev: any, index: number) {
        const tags = _.filter(this.tags, (tag: TagDto) => (!_.includes(this.selectedTagsKeys, tag.key)));
        const validate = new EventEmitter();

        this.workflowDialog.showPopup.next({
            component: CustomTagsPopoverComponent,
            event: ev,
            props: {
                tags,
                validate,
            }
        });

        validate.subscribe((tag: TagDto) => {
            this.workflowDialog.dismiss();
            if (!tag) { return; }
            if (this.selectedTags[index]) {
                if (this.selectedTags[index].key === this.selectedTagsKeys[index]) {
                    this.selectedTags[index] = tag;
                    this.selectedTagsKeys[index] = tag.key;
                } else {
                    const selectedTag: string = this.selectedTags[index].key;
                    this.selectedTags[index] = tag;
                    this.selectedTagsKeys = _.map(this.selectedTagsKeys, (tagKey: string) => {
                        if (tagKey === selectedTag) { tagKey = this.selectedTags[index].key; }
                        return tagKey;
                    });
                }
            } else {
                this.selectedTagsKeys.push(tag.key);
                this.selectedTags.push(tag);
                if (this.selectedTags.length === this.defaultChips.length) { this.defaultChips.push([]); }
            }
            this.change.emit(this.selectedTagsKeys);
        });
    }
}
