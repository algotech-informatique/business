import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { DocumentMetadatasDto } from '@algotech-ce/core';
import { DocumentsMetaDatasSettingsDto } from '@algotech-ce/core';
import { TranslateLangDtoService } from '@algotech-ce/angular';

@Component({
    selector: 'at-form-metadatas',
    templateUrl: './task-metadatas.component.html',
    styleUrls: ['./task-metadatas.component.scss']
})
export class TaskMetadatasComponent implements OnInit {

    constructor(
        private translateLang: TranslateLangDtoService,
    ) { }

    @Input() metadatasList: DocumentsMetaDatasSettingsDto[] = [];
    @Input() metadatas: DocumentMetadatasDto[];
    @Output() metadataChange = new EventEmitter();
    listMetadatas = [];

    ngOnInit() {
        this.listMetadatas = _.reduce(this.metadatasList, (result, settingMetadata: DocumentsMetaDatasSettingsDto) => {
            const docMeta = _.find(this.metadatas, { key: settingMetadata.key });
            const data = {
                key: settingMetadata.key,
                displayName: this.translateLang.transform(settingMetadata.displayName),
                value: docMeta ? docMeta.value : '',
            };
            result.push(data);
            return result;
        }, []);
    }

    onChangeValue($event) {
        this.metadataChange.emit(_.map(this.listMetadatas, (meta) => ({ key: meta.key, value: meta.value })))
    }

}
