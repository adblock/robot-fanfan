import { AverageCostStrategyClass } from '../strategy/tuijian/average.cost.strategy.class';
import { TaobaoFeedflowItemCrowdModifyBindClass,TaobaoFeedflowItemCrowdRpthourlistClass } from '../api'



for (let i = 0; i < 1; i++) {
    console.log(i,new Date(),'----------------------------------------------');
    // 选择策略生成数据
    const taobaoFeedflowItemCrowdRpthourlist = new TaobaoFeedflowItemCrowdRpthourlistClass;
    taobaoFeedflowItemCrowdRpthourlist.setRequest({
        campaign_id:1,
        end_hour_id:1,
        adgroup_id:1,
        crowd_id:1,
        log_date:'2020-01-01',
        start_hour_id:1,
    })
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
//         console.log(i,new Date(),'----------------------------------------------');
//         // 选择策略生成数据
//         const taobaoFeedflowItemCrowdRpthourlist = new TaobaoFeedflowItemCrowdRpthourlistClass;
//         taobaoFeedflowItemCrowdRpthourlist.setRequest({
//             campaign_id:1,
//             end_hour_id:1,
//             adgroup_id:1,
//             crowd_id:1,
//             log_date:'2020-01-01',
//             start_hour_id:1,
//         })
//         taobaoFeedflowItemCrowdRpthourlist.getResponse();
//         const averageCostStrategy = new AverageCostStrategyClass(
//             {test:i},
//             taobaoFeedflowItemCrowdRpthourlist,
//             new TaobaoFeedflowItemCrowdModifyBindClass,
//         );
//         averageCostStrategy.handle();
//     }
// },180000);
