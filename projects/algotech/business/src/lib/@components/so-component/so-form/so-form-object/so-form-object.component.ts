import { Component, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { SmartObjectDto, SmartPropertyModelDto, TagListDto, SmartPropertyObjectDto, SmartModelDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { Subject, of } from 'rxjs';
import { debounceTime, tap, catchError, mergeMap } from 'rxjs/operators';
import { SoUtilsService } from '../../../../workflow-interpretor/@utils/so-utils.service';
import { ISoFormProperty, ISoFormBreadCrumb } from '../so-form-interface';
import { SoFormService } from '../so-form.service';
import { SoFormPropertyComponent } from './so-form-property/so-form-property.component';
import { SmartObjectsService, NetworkService } from '@algotech-ce/angular';
import { SoUtils } from '../../../../../../interpretor/src';

@Component({
    selector: 'at-so-form-object',
    styleUrls: ['./so-form-object.component.scss'],
    templateUrl: './so-form-object.component.html',
})
export class SoFormObjectComponent {
    @Input() object: SmartObjectDto;
    @Input() tagsLists: TagListDto[];
    @Input() taggable: boolean;

    @ViewChildren(SoFormPropertyComponent) soFormProperty: QueryList<SoFormPropertyComponent>;

    @Output() changeView = new EventEmitter<ISoFormBreadCrumb>();
    @Output() changeValue = new EventEmitter();

    properties: {
        property: ISoFormProperty,
        comment: ISoFormProperty,
        file: ISoFormProperty,
    }[] = [];

    tags: string[];
    obsChange = new Subject();

    constructor(
        private networkService: NetworkService,
        private soFormUtils: SoFormService,
        private soService: SmartObjectsService,
        public soUtils: SoUtilsService,
        private soFormService: SoFormService,
    ) {

        this.obsChange.pipe(
            tap(() => { this.refresh(); }),
            debounceTime(200),
            mergeMap((property?: SmartPropertyObjectDto) => {
                // unique
                if (this.object && property) {
                    const model = this.soFormUtils.getModel(this.object.modelKey);
                    if (model.uniqueKeys && model.uniqueKeys.length > 0 && model.uniqueKeys.includes(property.key)) {

                        if (this.networkService.offline) {
                            return of({});
                        }

                        this.soFormUtils.setUnique(this.object, false);
                        this.changeValue.emit();

                        return this.soService.unique(this.object).pipe(
                            catchError((e) => of(true)),
                            tap((unique: boolean) => {
                                this.soFormUtils.setUnique(this.object, unique);
                                this.soFormProperty.forEach((component: SoFormPropertyComponent) => {
                                    if (model.uniqueKeys.indexOf(component.property.key) > -1) {
                                        component.unique = unique;
                                    }
                                });
                            }));
                    }
                }
                return of({});
            })
        ).subscribe(() => {
            this.changeValue.emit();
        });
    }

    initialize() {
        if (this.object) {
            this.soFormUtils.current = this.object;

            const model = this.soFormUtils.getModel(this.object.modelKey);
            this.soUtils.repairInstance(this.object, model);
            this.initializeDefaultValue(model);
            const option = this.soFormUtils.options ? _.find(this.soFormUtils.options, (o) => o.model === model.key) : null;
            const properties = (option && option.properties.length > 0) ? _.reduce((option.properties), (results, optionProp) => {
                const prop = _.find(model.properties, (p) => p.key === optionProp.key);
                if (prop) {
                    results.push(prop);
                }
                return results;
            }, []) : model.properties;

            this.properties = _.reduce((properties), (results, prop) => {
                if (this.soUtils.propertyIsShowed(prop, model, this.soFormUtils.options) && !this.isExtended(prop)) {
                    let commentModel = this.soUtils.getExtended(model, prop.key, 'sys:comment');
                    commentModel = this.soUtils.propertyIsShowed(commentModel, model, this.soFormUtils.options) ? commentModel : null;

                    let fileModel = this.soUtils.getExtended(model, prop.key, 'sys:file');
                    fileModel = this.soUtils.propertyIsShowed(fileModel, model, this.soFormUtils.options) ? fileModel : null;

                    const property: ISoFormProperty = {
                        model: prop,
                        value: this.soUtils.getPropertyValue(this.object, prop.key),
                        disabled: this.isDisabled(prop, model),
                        showed: true,
                    };

                    const comment: ISoFormProperty = commentModel ? {
                        model: commentModel,
                        value: this.soUtils.getPropertyValue(this.object, commentModel.key),
                        disabled: this.isDisabled(commentModel, model),
                        showed: true,
                    } : null;

                    const file: ISoFormProperty = fileModel ? {
                        model: fileModel,
                        value: this.soUtils.getPropertyValue(this.object, fileModel.key),
                        disabled: this.isDisabled(fileModel, model),
                        showed: true,
                    } : null;

                    results.push({ property, comment, file });
                }
                return results;
            }, []);

            const propr = this.initializeUniqueKeys(model, properties);
            if (propr.length !== 0) {
                for (const pr of propr) {
                    this.obsChange.next(pr);
                }
            } else {
                this.obsChange.next(null);
            }
        }
    }

    initializeDefaultValue(model: SmartModelDto) {
        model.properties.forEach((smProp: SmartPropertyModelDto) => {
            const option = this.soFormService.getOption(smProp, this.soFormService.current);
            if (option && option.defaultValue !== undefined) {
                const propObject = _.find(this.object.properties, (prp: SmartPropertyObjectDto) => prp.key === smProp.key);
                if (propObject && !propObject.value) {
                    propObject.value = option.defaultValue;
                }
            }
            
        });
    }

    initializeUniqueKeys(model: SmartModelDto, properties: SmartPropertyModelDto[]): SmartPropertyModelDto[] {
        return properties.reduce((result, smProp: SmartPropertyModelDto) => {
            if (model.uniqueKeys.indexOf(smProp.key) > -1) {
                result.push(smProp);
            }
            return result;
        }, []);
    }

    refresh() {
        const model = this.soFormUtils.getModel(this.object.modelKey);

        _.each(this.properties, (prop) => {
            prop.property.disabled = this.isDisabled(prop.property.model, model);
            prop.property.showed = this.isShowed(prop.property.model);
            if (prop.comment) {
                prop.comment.disabled = this.isDisabled(prop.comment.model, model);
                prop.comment.showed = this.isShowed(prop.comment.model);
            }

            if (prop.file) {
                prop.file.disabled = this.isDisabled(prop.file.model, model);
                prop.file.showed = this.isShowed(prop.file.model);
            }
        });
    }

    isDisabled(prop: SmartPropertyModelDto, model) {
        if (this.soFormUtils.readOnly || !this.soUtils.isAuthorized(prop, model, { eWrite: true })) {
            return true;
        }

        return !this.soFormUtils.respectConditions(prop, this.soFormUtils.current, 'enabled');
    }

    isShowed(prop: SmartPropertyModelDto) {
        return this.soFormUtils.respectConditions(prop, this.soFormUtils.current, 'visible');
    }

    isExtended(property: SmartPropertyModelDto) {
        return property.key.startsWith(SoUtils.EXPAND);
    }

    onChangeView(data: ISoFormBreadCrumb) {
        this.changeView.emit(data);
    }

    onChangeValue(property: SmartPropertyObjectDto) {
        this.obsChange.next(property);
    }

    onTagsChanged(tags: string[]) {
        if (this.taggable) { this.object.skills.atTag = { tags }; }
        this.obsChange.next(null);
    }

}
