import { AverageCostStrategyClass } from '../strategy/average.cost.strategy.class';
import { TaobaoFeedflowItemCrowdModifyBindClass,TaobaoFeedflowItemCrowdRpthourlistClass } from '../api'



for (let i = 0; i < 8000; i++) {
    console.log(i,'----------------------------------------------');
    // 选择策略生成数据
    const taobaoFeedflowItemCrowdRpthourlist = new TaobaoFeedflowItemCrowdRpthourlistClass;
    taobaoFeedflowItemCrowdRpthourlist.getResponse();
    const averageCostStrategy = new AverageCostStrategyClass(
        {test:i},
        taobaoFeedflowItemCrowdRpthourlist,
        new TaobaoFeedflowItemCrowdModifyBindClass,
    );
    averageCostStrategy.handle();
}

// setInterval(function () {
//     for (let i = 0; i < 4000; i++) {
//         console.log(i,'----------------------------------------------');
//         // 选择策略生成数据
//         const taobaoFeedflowItemCrowdRpthourlist = new TaobaoFeedflowItemCrowdRpthourlistClass;
//         taobaoFeedflowItemCrowdRpthourlist.getResponse();
//         const averageCostStrategy = new AverageCostStrategyClass(
//             {test:i},
//             taobaoFeedflowItemCrowdRpthourlist,
//             new TaobaoFeedflowItemCrowdModifyBindClass,
//         );
//         averageCostStrategy.handle();
//     }
// },180000)
