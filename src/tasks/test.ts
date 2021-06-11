import { AverageCostStrategyClass } from '../strategy/tuijian/average.cost.strategy.class';
// import { TaobaoFeedflowItemCrowdModifyBindClass,TaobaoFeedflowItemCrowdRpthourlistClass } from '../api'


// const strategyData : { 
//     request: {
//         campaign_id:number,
//         end_hour_id:number,
//         adgroup_id:number,
//         crowd_id:number,
//         log_date:string,
//         start_hour_id:number,
//         crowds: {
//             price:number,
//             status:string,
//             crowd_id:number,
//         }[];
//     },wangwangid:string
// }

//TODO 此处为用户传入数据，应该没有这么多参数，暂时假设 
const strategyData  =  { 
    request :  {
        campaign_id:2,
        end_hour_id:2,
        adgroup_id:2,
        crowd_id:2,
        log_date:'string',
        start_hour_id:2,
        crowds: [
            {
                price:1,
                status:'string',
                crowd_id:2,
            }
        ],
        crowd_query: [{
            adgroup_id:2,
            crowd_id:2,
        }],
    },
    wangwangid:'string',
    total_budget:230000 //单位是分
}

for (let i = 0; i < 1; i++) {
    console.log(i,new Date(),'----------------------------------------------');
    const averageCostStrategy = new AverageCostStrategyClass(
        strategyData
        // {test:i},
        // new TaobaoFeedflowItemCrowdRpthourlistClass,
        // new TaobaoFeedflowItemCrowdModifyBindClass,
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
