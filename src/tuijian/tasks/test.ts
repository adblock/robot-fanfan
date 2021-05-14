import { AverageCostStrategyClass } from '../strategy/average.cost.strategy.class';
import { TaobaoFeedflowItemCrowdModifyBindClass,TaobaoFeedflowItemCrowdRpthourlistClass } from '../api'
// 选择策略生成数据

const averageCostStrategy = new AverageCostStrategyClass(
    {test:1},
    new TaobaoFeedflowItemCrowdRpthourlistClass,
    new TaobaoFeedflowItemCrowdModifyBindClass,
);
const result = averageCostStrategy.handle();
console.log(result.getResponse());
