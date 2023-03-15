import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { LinkDocument } from '../../../dto/link-document/link-document.dto';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { DocSOFilesService } from '../so-document/so-document.service';

@Component({
    selector: 'at-so-link-document',
    templateUrl: './so-link-document.component.html',
    styleUrls: ['./so-link-document.component.scss'],
})
export class SoLinkDocumentComponent {

    @Input() linkDocuments: any[] = [];
    @Input() searchVisible = false;
    @Input() multipleSelection = false;
    @Input() mode: 'check' | 'cart' = 'cart';

    @Output() changeValue = new EventEmitter<{ value: any | any[], valid: boolean }>();
    @Output() handleError = new EventEmitter<string>();

    searchValue = '';

    elements: LinkDocument[] = [];
    elementsListed: LinkDocument[] = [];
    cart: LinkDocument[] = [];
    page = 0;
    pageDefaultSize = 10;
    cartView = false;
    moreDataToLoad = false;
    isLoading = false;
    loadingSpinner = false;
    query: any;
    obsSearch = new Subject();
    subscription: Subscription;

    constructor(
        private docFilesService: DocSOFilesService,
        private ref: ChangeDetectorRef,
    ) {
        this.loadMoreResults();
        if (this.multipleSelection && this.mode === 'check') {
            this.changeValue.emit({ value: [], valid: false });
        }
    }

    filterElements() {
        this.cartView = false;
        this.page = 0;
        this.elementsListed = [];
        this.loadMoreResults();
    }

    loadMoreResults() {
        if (!this.isLoading) {
            this.isLoading = true;
            this.searchDocuments$().subscribe();
        }
    }

    searchDocuments$(): Observable<any> {
        this.query = { so: [], layers: [], tags: [], texts: this._cutInputString(this.searchValue), metadatas: [] };
        return this.docFilesService.searchDocuments$(this.query, this.page, this.pageDefaultSize).pipe(
            map((docs: LinkDocument[]) => {
                if (docs && docs.length > 0) {
                    const _docs = docs.map((doc) => {
                        const findOnCart = this.cart.find((ele) => ele.uuid === doc.uuid);
                        if (findOnCart) {
                            return findOnCart;
                        } else {
                            return doc;
                        }
                    });
                    this.elements.push(..._docs);
                    this.elementsListed = _docs;
                    this.page++;
                    this.moreDataToLoad = !(_docs.length < this.pageDefaultSize);
                } else {
                    this.moreDataToLoad = false;
                }
                this.isLoading = false;

            }, (err) => {
                this.handleError.emit(err.message);
            })
        );
    }

    _cutInputString(input: string): string[] {
        const texts = _.clone(input);
        const groups = input.match(/".*?"/g);
        const inputWithoutGroups = _.reduce(groups, (result, g) => {
            return result = result.replace(g, '');
        }, texts);
        let results: string[] = inputWithoutGroups.split(' ');
        results.push(..._.map(groups, g => {
            return g.replace(/"/g, '');
        }));
        results = _.filter(results, r => r !== '');
        return results.length === 0 ? [''] : results;
    }

    cartClick() {
        this.cartView = !this.cartView;
        this.ref.detectChanges();
        const content = document.querySelector('.at-list-content');
        if (content) {
            content.scrollTop = 0;
        }
    }

    onDelete(ele: LinkDocument) {
        const index = _.findIndex(this.cart, (b: LinkDocument) => b.uuid === ele.uuid);
        const findElt = _.find(this.elementsListed, (e: LinkDocument) => e.uuid === ele.uuid);

        if (index > -1) {
            this.cart.splice(index, 1);
        }

        if (findElt) {
            findElt.deletable = false;
        }

        const items = _.map(this.cart, (c: LinkDocument) => c.file);
        this.changeValue.emit({ value: items, valid: items.length > 0 });
    }

    onSelect(ele: LinkDocument) {
        if (this.multipleSelection) {
            switch (this.mode) {
                case 'check':
                    ele.checked = !ele.checked;
                    const itemsChecked = _.map(this.elementsListed.filter((e) => e.checked), (e: LinkDocument) => e.file);
                    this.changeValue.emit({ value: itemsChecked, valid: itemsChecked.length > 0 });
                    break;
                case 'cart':
                    ele.deletable = true;
                    this.cart.push(ele);
                    const items = _.map(this.cart, (b: LinkDocument) => b.file);
                    this.changeValue.emit({ value: items, valid: items.length > 0 });
                    break;
            }
        } else {
            this.changeValue.emit({ value: ele.file, valid: true });
        }
    }
}
