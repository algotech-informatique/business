import { Injectable } from '@angular/core';
import { TagListDto } from '@algotech-ce/core';
import * as _ from 'lodash';

@Injectable()
export class TagsUtilsService {

    filterDocumentTagsLists(tagsLists: TagListDto[], documentIsImage: boolean): TagListDto[] {
        return _.reduce(tagsLists, (res: TagListDto[], tagsList: TagListDto) => {
            if (documentIsImage) {
                if (tagsList.applyToImages) {
                    res.push(tagsList);
                }
            } else {
                if (tagsList.applyToDocuments) {
                    res.push(tagsList);
                }
            }
            return res;
        }, []);
    }

}
