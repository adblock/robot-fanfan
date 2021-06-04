/**
 * AverageCostStrategyClass 
 * 
 * 人群平均花费策略的实例类，根据传入的数据，筛选数据，计算数据，构造为api类
 * 超级推荐【商品推广】单元分时报表查询
 * 文档：https://open.taobao.com/API.htm?docId=43477&docType=2
 * */

import { StrategyFuncClass } from '../strategy.func.class';
import { StrategyInterface } from '../strategy.interface';
import { ApiInterface } from '../../api/api.interface';

export class AverageCostStrategyClass implements StrategyInterface {
    // 策略的常量数据
    public strategyData:any | {};
    // 需要筛选的数据
    public fliterData:any | undefined;
    // 最终调整的结果
    public adjusteData:any | undefined;
    
    constructor(
            strategyData:any,
            fliterData:ApiInterface,
            adjusteData:ApiInterface,
        ){
        // 设置策略数据
        this.strategyData = strategyData;
        // 设置策略数据
        this.fliterData = fliterData;
        // 结果
        this.adjusteData = adjusteData;
    }

    private fliter(){
        const result = this.fliterData.getResponse().then((data:any)=>{
            const fliterData = data.feedflow_item_crowd_rpthourlist_response.result.rpt_list.rpt_result_dto;
            const strategy = new StrategyFuncClass(fliterData);
            const result = strategy
                .fliter([['campaign_id','=',1]])
                .fliter([['click','=',0]])
                .getResult();
            console.log(result);
            return data;

        });
        return result;
    }

    private adjuster (fliterDataResult:any){
        const result = fliterDataResult.then((data:any)=>{
            // console.log(data,2);
            this.adjusteData.setRequest({
                price:1, 
                status:'start', 
                crowd_id:2, 
                adgroup_id:3
            })
            return this.adjusteData.getResponse()
        });
        return result;
    }

    // 计算的方法，返回CrowdsModifyBindAdjusterClass
    public handle():Promise<ApiInterface>{
        // 获取人群数据筛选出结果数据
        const fliterDataResult   = this.fliter();
        // // 根据筛选结果，声明更改数据的接口对象
        // const adjusterDataResult = this.adjuster(fliterDataResult);
        // adjusterDataResult.then(function (data:any) {
        //     // console.log(new Date());
        //     // console.log(data.httpdns_get_response.request_id);
        // });
        // 请求数据
        return fliterDataResult;
    }
}

