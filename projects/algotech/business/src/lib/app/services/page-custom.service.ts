import { AuthService, SettingsDataService, TranslateLangDtoService } from '@algotech-ce/angular';
import { SmartObjectDto, SnPageWidgetDto } from '@algotech-ce/core';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import moment from 'moment';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { InterpretorResolver } from '../../../../interpretor/src';
import { SoUtilsService } from '../../workflow-interpretor/@utils/so-utils.service';
import { WorkflowAbstractService } from '../../workflow-interpretor/workflow-abstract/workflow-abstract.service';
import { PageData } from '../models';
import { DSResolver } from '../models/ds-resolver';
import { PageEventsService } from './page-events.service';
import { PageUtilsService } from './page-utils.service';

@Injectable()
export class PageCustomService extends InterpretorResolver {

    constructor(
        protected workflowAbstract: WorkflowAbstractService,
        private soUtils: SoUtilsService,
        private settingsDataService: SettingsDataService,
        private authService: AuthService,
        private pageUtils: PageUtilsService,
        private pageEvents: PageEventsService,
        private translateLangDtoService: TranslateLangDtoService,
    ) {
        super(workflowAbstract);
    }

    resolveCustom(custom: any, origin: any, initialize: boolean, item: PageData, resolveDSContext: DSResolver): Observable<any> {
        const props: string[] = [];
        for (const prop in origin) {
            if (origin.hasOwnProperty(prop)) {
                if (!prop.startsWith('__') && origin[prop] !== null) {
                    props.push(prop);
                }
            }
        }

        const resolve$ = props.map((prop) => {
            return this.resolveProp(prop, origin, custom, initialize, item, resolveDSContext).pipe(
                catchError(() => this.resolveProp(prop, origin, custom, true, item, resolveDSContext)), // error re-initialize
            );
        });

        return resolve$.length === 0 ? of([]) : zip(...resolve$);
    }

    resolveProp(prop: string, origin: any, custom: any, initialize: boolean, item: PageData, resolveDSContext: DSResolver) {
        return this.calculateValue(prop, origin[prop], initialize, item, resolveDSContext, origin.formatted).pipe(
            tap((res) => {
                custom[prop] = res;

                // documents
                if ((Array.isArray(res) && res[0] instanceof SmartObjectDto) || res instanceof SmartObjectDto) {
                    custom['__documents'] = (Array.isArray(res) ? res : [res]).reduce((results, smartObject: SmartObjectDto) => {
                        results.push(..._.cloneDeep(this.soUtils.getDocuments(smartObject, this.pageEvents.documents)));
                        return results;
                    }, []);
                }
            })
        );
    }

    calculateValue(propName: string, propValue: any, initialize = false, item?: PageData, resolveDSContext?: DSResolver,
        formatted = false, byValue = true): Observable<any> {

        //system
        const system = this._calculateSystem(propValue, item, resolveDSContext, formatted);
        if (system) {
            return system;
        }

        // formula
        const formula = this._calculateFormula(propValue, false, (v: any) =>
            this.calculateValue(propName, v, initialize, item, resolveDSContext));
        if (formula) {
            return formula;
        }

        // array
        const array = this._calculateValueArray(propName, propValue, {}, (v) =>
            this.calculateValue(propName, v, initialize, item, resolveDSContext), false);
        if (array) {
            return array;
        }

        const varInformation = this.getVarInformation(propValue);
        if (!varInformation) {
            return of(_.cloneDeep(propValue));
        }

        if (initialize) {
            return of(propValue.replace(`{{${varInformation.symbole}}}`, '--'));
        }

        const findData = this.getData(item, varInformation.varName, resolveDSContext.widget);
        return (findData ? of(findData) : (resolveDSContext ? this.pageEvents.resolveDataSource(varInformation.varName, resolveDSContext) : of(null))).pipe(
            mergeMap((data) => {
                if (!data) {
                    return of(null);
                }
                const split = varInformation.split;
                split.shift();
                const type = data.type;

                try {
                    const resolveData = this._calculateData(data.value, type, this.pageEvents.smartobjects, this.authService.localProfil.preferedLang);
                    return this._calculateValueBrowse(split, resolveData, type, this.pageEvents.smartobjects,
                        this.settingsDataService.smartmodels,
                        this.settingsDataService.glists,
                        this.authService.localProfil.preferedLang, { formatted, byValue, nullIfError: true });
                } catch (e) {
                    return throwError(e);
                }
            })
        )
    }

    _calculateSystem(propValue: any, item?: PageData, resolveDSContext?: DSResolver, formatted = false): Observable<any> {

        const varInformation = this.getVarInformation(propValue);
        if (!varInformation) {
            return null;
        }
        if (varInformation.split.length < 2) {
            return null;
        }
        if (varInformation.split[0] !== 'system') {
            return null;
        }

        const lang = this.authService.localProfil.preferedLang;
        let systemVariable = '';
        switch (varInformation.split[1]) {
            case 'time':{
                if (formatted) {
                    systemVariable = moment(moment.now()).format('HH:mm:ss');
                } else {
                    systemVariable = moment(moment.now()).format('LT');
                }
                break;
            }
            case 'date': {
                if (formatted) {
                    systemVariable = moment(moment.now()).utc(true).startOf('day').format();
                } else {
                    systemVariable = new Date(moment.now()).toLocaleDateString(lang);
                }
                break;
            }
            case 'now': {
                if (formatted) {
                    systemVariable = moment(moment.now()).format();
                } else {
                    systemVariable = moment(moment.now()).format('L LT');
                }
                break;
            }
            case 'page-name': {
                systemVariable = this.translateLangDtoService.transform( resolveDSContext.snPage.displayName);
                break;
            }
            case 'app-name': {
                systemVariable = this.translateLangDtoService.transform( resolveDSContext.appModel.displayName);
                break;
            }
            default:
                systemVariable = '';
        }       
        return of(propValue.replace(`{{${varInformation.symbole}}}`, systemVariable)); 
    }

    getData(item: PageData, varName: string, widget: SnPageWidgetDto) {
        return this.pageEvents.getData(item).find((data) => {
            // check key
            if (data.key !== varName) {
                return false;
            }

            // unloaded
            if (data.unloaded) {
                if (data.unloadedRelativeTo && widget) {
                    return data.unloadedRelativeTo.id !== widget?.id &&
                        this.pageUtils.getChilds(data.unloadedRelativeTo, true).every((child) => 
                            child.id !== widget?.id);
                }
                return false;
            }
            return true;
        });
    }

    getVarInformation(propValue: string) {
        const symboles = this._getSymboles(propValue);
        if (symboles.length === 0) {
            return null;
        }
        const symbole = symboles[0].slice(2, symboles[0].length - 2);
        const split = symbole.split('.');

        return {
            varName: `${split[0]}.${split[1]}`,
            symbole,
            split
        };
    }
}
