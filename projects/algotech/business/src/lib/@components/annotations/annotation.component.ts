import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { TagListDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { CameraFile } from '../../dto/camera-file.dto';

@Component({
    selector: 'at-annotation',
    styleUrls: ['./annotation.component.scss'],
    templateUrl: './annotation.component.html'
})

export class AnnotationComponent implements OnChanges {

    @Input() consultation: boolean;
    @Input() edition: boolean;
    @Input() fileNameVisible: boolean;
    @Input() listImages: CameraFile[] = [];

    @Input() tagsLists: TagListDto[] = [];
    @Input() tags: string[] = [];
    @Input() taggable: boolean;
    @Input() photo = true;
    @Input() multiple: boolean;

    @Output() deleteImage = new EventEmitter();
    @Output() reset = new EventEmitter();
    @Output() tagsChanged = new EventEmitter<string[]>();
    @Output() changed = new EventEmitter();

    @Output() downloadDoc = new EventEmitter<string>();

    currentPhoto: CameraFile;

    constructor(
    ) { }

    ngOnChanges() {
        if (this.listImages.length === 0) {
            this.currentPhoto = null;
            return ;
        }
        this.currentPhoto = this.listImages[0];
    }

    selectPrev() {
        const index = this.listImages.indexOf(this.currentPhoto);
        if (index === 0) {
            return;
        }
        this.currentPhoto = this.listImages[index - 1];
    }

    selectNext() {
        const index = this.listImages.indexOf(this.currentPhoto);
        if (index === this.listImages.length - 1) {
            return;
        }
        this.currentPhoto = this.listImages[index + 1];
    }

    onAnnotationChange() {
        this.changed.emit();
    }

    onDeleteImage() {
        const images: CameraFile[] = this.listImages;
        const index = _.findIndex(images, (li: CameraFile) => li.versionID === this.currentPhoto.versionID);
        if (index !== -1) {
            images.splice(index, 1);
            this.deleteImage.emit();
            if (this.listImages.length > 0) {
                this.currentPhoto = this.listImages[index > 0 ? index - 1 : 0];
            } else {
                this.currentPhoto = null;
            }
        }
    }

    onTagChanged(tags: string[]) {
        this.tagsChanged.emit(tags);
    }

    onResetImages() {
        this.reset.emit();
        this.currentPhoto = null;
    }

    onDownloadDoc(versionID: string) {
        this.downloadDoc.emit(versionID);
    }
}
