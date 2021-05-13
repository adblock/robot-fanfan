/**
 * StrategyFuncClass 
 * 
 * 策略类的通用方法，可以链式调用根据条件筛选数据
 * */
import _ from 'lodash';

export class StrategyFuncClass {
    constructor(data:object[]){
        this.data = data;
    }

    private data:object[] = [];         // 筛选数据
    private fliterCount:number = 0;     // fliter的计数器
    private tmpResult:object[] = [];    // 结果的临时数据
    private result:object[] = [];       // 最终结果数据
    private conditions = {              // 查询条件对应的函数
        '>':this.gt,
        '<':this.lt,
        '=':this.eq,
        '<=':this.lte,
        '>=':this.gte,
        '!==':this.notEq,
    };

    /**
     * 大于条件
     * fKey     查询data数据的key
     * fValue   查询data数据需要比较的值
     * data     需要查询的数据
     * **/
    private gt(fKey:string,fValue:string,data:any[]){
        return _.filter(data, function (value) {
            if(value.hasOwnProperty(fKey)){
                return _.gt(value[fKey], fValue);
            }else{
                return false;
            } 
        });
    }

    /**
     * 小于条件
     * fKey     查询data数据的key
     * fValue   查询data数据需要比较的值
     * data     需要查询的数据
     * **/
    private lt(fKey:string,fValue:string,data:any[]){
        return _.filter(data, function (value) {
            if(value.hasOwnProperty(fKey)){
                return _.lt(value[fKey], fValue);
            }else{
                return false;
            } 
        });
    }

    /**
     * 等于条件
     * fKey     查询data数据的key
     * fValue   查询data数据需要比较的值
     * data     需要查询的数据
     * **/
    private eq(fKey:string,fValue:string,data:any[]){
        return _.filter(data, function (value) {
            if(value.hasOwnProperty(fKey)){
                return _.isEqual(value[fKey], fValue);
            }else{
                return false;
            }
        });
    }

    /**
     * 小于等于条件
     * fKey     查询data数据的key
     * fValue   查询data数据需要比较的值
     * data     需要查询的数据
     * **/
    private lte(fKey:string,fValue:string,data:any[]){
        return _.filter(data, function (value) {
            if(value.hasOwnProperty(fKey)){
                return _.lte(value[fKey], fValue);
            }else{
                return false;
            }
        });
    }

     /**
     * 大于等于条件
     * fKey     查询data数据的key
     * fValue   查询data数据需要比较的值
     * data     需要查询的数据
     * **/
    private gte(fKey:string,fValue:string,data:any[]){
        return _.filter(data, function (value) {
            if(value.hasOwnProperty(fKey)){
                return _.gte(value[fKey], fValue);
            }else{
                return false;
            }
        });
    }

     /**
     * 不等于条件
     * fKey     查询data数据的key
     * fValue   查询data数据需要比较的值
     * data     需要查询的数据
     * **/
    private notEq(fKey:string,fValue:string,data:any[]){
        return _.filter(data, function (value) {
            if(value.hasOwnProperty(fKey)){
                return !_.eq(value[fKey], fValue);
            }else{
                return false;
            }
        });
    }

     /**
     * 不等于条件
     * cons     查询的条件 [['ad_pv','>','2'],['campaign_id','=',5]]
     * **/
    public fliter(cons: any[][]):StrategyFuncClass {
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

     /**
     * 返回最终的筛选条件
     * **/
    public getResult(){
        this.result = this.tmpResult;
        return this.result;
    }
}
