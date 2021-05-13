import { AverageCostStrategyClass } from '../strategy/average.cost.strategy.class';

// 获取数据
let campaignData = [
    {
        "campaign_name":"测试",
        "campaign_id":1,
        "alipay_inshop_amt":"345.33",
        "alipay_in_shop_num":33,
        "deep_inshop_num":2345,
        "inshop_pv":1,
        "click":2,
        "hour_id":20,
        "ad_pv":3,
        "gmv_inshop_num":33,
        "avg_access_page_num":"3455",
        "inshop_uv":1,
        "gmv_inshop_amt":"345.33",
        "icvr":"0.54",
        "new_f_charge":"23.44",
        "ecpm":"1.25",
        "cart_num":23,
        "cvr":"0.89",
        "ecpc":"0.5",
        "log_date":"1556100655634",
        "avg_access_time":"0.56",
        "follow_number":343556,
        "inshop_item_col_num":89,
        "charge":"234.53",
        "inshop_uv_rate":"0.5",
        "add_new_uv":89,
        "roi":"1.01",
        "add_new_uv_rate":"1.09",
        "crowd_id":'',
        "crowd_name":"",
        "adgroup_id":'',
        "adgroup_name":""
    },
    {
        "campaign_name":"测试2",
        "campaign_id":2,
        "alipay_inshop_amt":"345.33",
        "alipay_in_shop_num":33,
        "deep_inshop_num":2345,
        "inshop_pv":1,
        "click":2,
        "hour_id":20,
        "ad_pv":1,
        "gmv_inshop_num":33,
        "avg_access_page_num":"3455",
        "inshop_uv":1,
        "gmv_inshop_amt":"345.33",
        "icvr":"0.54",
        "new_f_charge":"23.44",
        "ecpm":"1.25",
        "cart_num":23,
        "cvr":"0.89",
        "ecpc":"0.5",
        "log_date":"1556100655634",
        "avg_access_time":"0.56",
        "follow_number":343556,
        "inshop_item_col_num":89,
        "charge":"234.53",
        "inshop_uv_rate":"0.5",
        "add_new_uv":89,
        "roi":"1.01",
        "add_new_uv_rate":"1.09",
        "crowd_id":'',
        "crowd_name":"",
        "adgroup_id":'',
        "adgroup_name":""
    }
];

// 选择策略生成数据
let averageCostStrategy = new AverageCostStrategyClass(campaignData);
let averageCostStrategyData = averageCostStrategy.handle();
console.log(averageCostStrategyData);

