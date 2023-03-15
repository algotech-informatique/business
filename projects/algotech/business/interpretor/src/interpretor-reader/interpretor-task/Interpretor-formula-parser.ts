import * as _ from 'lodash';
import moment from 'moment';

export class InterpretorFormulaParser {

    private formula: string;
    private parameters = [];
    private values = [];
    public tryParseFormula(formula: string, values): boolean {
        if (formula === undefined) {
            return false;
        }
        const func = _.replace(formula, new RegExp('"', 'g'), '').split('(');
        this.formula = (func.length > 0) ? func[0] : '';
        this.parameters = (func.length > 1) ? _.reduce(func[1].split(')')[0].split(','), (r, p) => {
            if (_.trim(p) !== '') {
                r.push(p)
            }
            return r;
        }, []) : [];
        this.values = values;
        return (['DATETOSTR', 'STRTODATE', 'DATESUBTRACT', 'DATEADD', 'STRINGIFY', 'PARSE', 'NUMBERVALUE', 'EOMONTH'].indexOf(func[0]) !== -1)
    }

    public executeFormula() {
        switch (this.formula) {
            case 'DATETOSTR':
                if (this.parameters.length < 2) {
                    return { error: `Date formula missing ${2 - this.parameters.length} parameter(s)` }
                }
                return { result: moment(this.parameters[0]).format(this.parameters[1]) };
            case 'DATESUBTRACT':
                if (this.parameters.length < 3) {
                    return { error: `Date formula missing ${3 - this.parameters.length} parameter(s)` }
                }
                return { result: moment(this.parameters[0]).subtract(this.parameters[1], this.parameters[2]) };
            case 'DATEADD':
                if (this.parameters.length < 3) {
                    return { error: `Date formula missing ${3 - this.parameters.length} parameter(s)` }
                }
                return { result: moment(this.parameters[0]).add(this.parameters[1], this.parameters[2]) };
            case 'EOMONTH':
                if (this.parameters.length < 2) {
                    return { error: `Date formula missing ${2 - this.parameters.length} parameter(s)` }
                }
                return { result: moment(this.parameters[0]).add(this.parameters[1], 'month').endOf('month') };
            case 'NUMBERVALUE':
                if (this.parameters.length < 1) {
                    return { error: `Date formula missing ${1 - this.parameters.length} parameter(s)` }
                }
                return { result: +this.parameters[0]};
            case 'STRINGIFY':
                if (this.values.length === 0) {
                    return { error: `STRINGIFY formula: parameter missing` }
                }
                try {
                    const result = JSON.stringify(this.values[0]);
                    return { result };
                } catch (error) {
                    return { error: `STRINGIFY formula: unable to stringify input` }
                }
            case 'PARSE':
                if (this.parameters.length === 0) {
                    return { error: `PARSE formula: parameter missing` }
                }
                try {
                    const result = JSON.parse(this.parameters.map((param: string) => `${param.replace(/”/g, '"')}`).join(','));
                    return { result };
                } catch (error) {
                    return { error: `PARSE formula: unable to parse` }
                }
            default:
                if (this.parameters.length < 2) {
                    return { error: `Date formula missing ${2 - this.parameters.length} parameter(s)` }
                }
                return { result: moment(this.parameters[0], this.parameters[1]) };
        };
    }
}