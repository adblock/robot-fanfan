import { StrategyFuncClass } from './strategy.func.class';
import { StrategyInterface } from './strategy.interface';
import { CrowdsModifyBindAdjusterClass } from '../adjuster/crowds.modifybind.adjuster';

export class AverageCostStrategyClass implements StrategyInterface {
    public data:[any];
    constructor(data:any){
        this.data = data;
    }
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
        crowdsAdjuster.add({
            price:0,
            status:'start',
            crowd_id:0,
            adgroup_id:0
        });
        return crowdsAdjuster;
    }
}




