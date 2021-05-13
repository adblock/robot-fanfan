import _ from 'lodash';

export class StrategyFuncClass {
    constructor(data:Array<any>){
        this.data = data;
    }
    private data = {};
    private fliterCount = 0;
    private tmpResult:Array<any> = [];
    private result:Array<any> = [];
    private conditions = {
        '>':this.gt,
        '<':this.lt,
        '=':this.eq,
        '<=':this.lte,
        '>=':this.gte,
        '!==':this.notEq,
    };
    private gt(fKey:string,fValue:string,data:[any]){
        return _.filter(data, function (value) {
            return _.gt(value[fKey], fValue);
        });
    }

    private lt(fKey:string,fValue:string,data:[any]){
        return _.filter(data, function (value) {
            return _.lt(value[fKey], fValue);
        });
    }
    private eq(fKey:string,fValue:string,data:[any]){
        return _.filter(data, function (value) {
            return _.isEqual(value[fKey], fValue);
        });
    }
    private lte(fKey:string,fValue:string,data:[any]){
        return _.filter(data, function (value) {
            return _.lte(value[fKey], fValue);
        });
    }
    private gte(fKey:string,fValue:string,data:[any]){
        return _.filter(data, function (value) {
            return _.gte(value[fKey], fValue);
        });
    }
    private notEq(fKey:string,fValue:string,data:[any]){
        return _.filter(data, function (value) {
            return !_.eq(value[fKey], fValue);
        });
    }

    public fliter(cons: Array<string[]>): any {
        let data:{};
        if(this.fliterCount === 0){
            data = this.data;
        }else {
            data = this.tmpResult;
        }
        this.fliterCount++;
        let tmpData:Array<any> = [];
        _(cons).each((con)=> {
            let rule = _.get(this.conditions, con[1]);
            let ruleData = rule(con[0],con[2],data);
            tmpData = _.union(tmpData, ruleData);
        });
        this.tmpResult = tmpData;
        return this;
    }

    public getResult(){
        this.result = this.tmpResult;
        return this.result;
    }
}
