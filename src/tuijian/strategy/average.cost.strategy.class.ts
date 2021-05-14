/**
 * AverageCostStrategyClass 
 * 
 * 人群平均花费策略的实例类，根据传入的数据，筛选数据，计算数据，构造为adjuster类
 * this.data 数据结构参考以下文档中的响应参数
 * 超级推荐【商品推广】单元分时报表查询-文档：https://open.taobao.com/API.htm?docId=43477&docType=2
 * */

import { StrategyFuncClass } from './strategy.func.class';
import { StrategyInterface } from './strategy.interface';
import { ApiInterface } from '../api/api.interface';

export class AverageCostStrategyClass implements StrategyInterface {
    // 策略的常量数据
    public strategyData:object | {};
    // 需要筛选的数据
    public fliterData:any | undefined;
    // 最终调整的结果
    public adjusteData:any | undefined;
    
    constructor(
            strategyData:object,
            fliterData:ApiInterface,
            adjusteData:ApiInterface,
        ){
        // 设置策略数据
        this.strategyData = strategyData;
        // 设置策略数据
        this.fliterData = fliterData.getResponse();
        // 结果
        this.adjusteData = adjusteData;
    }
    
    // 计算的方法，返回CrowdsModifyBindAdjusterClass
    public handle():ApiInterface{
        let strategy = new StrategyFuncClass(this.fliterData);
        let result = strategy.fliter([['ad_pv','>','2'],['campaign_id','=',5]])
            .getResult();

        this.adjusteData.setRequest({
            price:0,
            status:'start',
            crowd_id:0,
            adgroup_id:0
        });
        this.adjusteData.setRequest({
            price:0,
            status:'start',
            crowd_id:0,
            adgroup_id:0
        });
        
        return this.adjusteData;
    }
}




