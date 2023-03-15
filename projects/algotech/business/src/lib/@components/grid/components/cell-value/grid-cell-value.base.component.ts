import { PairDto } from '@algotech/core';
import { SoUtilsService } from '../../../../workflow-interpretor/@utils/so-utils.service';

export abstract class GridCellValueComponentBase {
    editable: boolean;
    key: string;
    type: string;
    multiple: boolean;
    showNullValue = false;
    showMultipleValues = true;
    items: PairDto[];
    value: any;
    icon: string;
    format: any;
    lineBreak = false;

    constructor(protected soUtils: SoUtilsService) {
    }

    formattedItems: PairDto[];
    formattedType = null;
    clickable = false;

    initialize() {
        switch (this.type) {
            case 'sys:comment': {
                this.value = this.value?.message ? this.value.message : this.value;
            }
                break;
            case 'string':
            case 'html':
                if (this.items) {
                    this.formattedItems = [...this.items];
                    if (!this.formattedItems.some((item) => !item.key)) {
                        this.formattedItems.unshift({
                            key: '',
                            value: null,
                        })
                    }

                    this.formattedType = 'select';
                } else {

                    this.formattedType = 'textarea';
                }
                break;
            case 'boolean':
                this.formattedType = 'checkbox';
                break;
            case 'number':
            case 'datetime':
            case 'date':
            case 'time':
                this.formattedType = this.type;
                break;
            default:
                this.formattedType = null;
                break;
        }
        this.clickable = this.editable && ((this.multiple && this.formattedType) || this.soUtils.typeIsSmartObject(this.type));
    }
}