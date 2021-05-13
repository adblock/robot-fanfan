/**
 * AverageCostStrategyClass 
 * 
 * 人群平均花费策略的实例类，根据传入的数据，筛选数据，计算数据，构造为adjuster类
 * this.data 数据结构参考以下文档中的响应参数
 * 超级推荐【商品推广】单元分时报表查询-文档：https://open.taobao.com/API.htm?docId=43477&docType=2
 * */

import { StrategyFuncClass } from './strategy.func.class';
import { StrategyInterface } from './strategy.interface';
import { CrowdsModifyBindAdjusterClass } from '../adjuster/crowds.modifybind.adjuster';

export class AverageCostStrategyClass implements StrategyInterface {
    // 需要筛选的数据
    public data:object[];
    constructor(data:object[]){
        this.data = data;
    }
    
    // 计算的方法，返回CrowdsModifyBindAdjusterClass
    public handle():CrowdsModifyBindAdjusterClass{
        let strategy = new StrategyFuncClass(this.data);
        let result = strategy.fliter([['ad_pv','>','2'],['campaign_id','=',5]])
            .getResult();
        
        let crowdsAdjuster = new CrowdsModifyBindAdjusterClass();

        crowdsAdjuster.add({
            price:0,
            status:'start',
            crowd_id:0,
            adgroup_id:0
        });
        crowdsAdjuster.add({
            price:0,
            status:'start',
            crowd_id:0,
            adgroup_id:0
        });
        
        return crowdsAdjuster;
    }
}




