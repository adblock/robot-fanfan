/**
 * TaobaoFeedflowItemCrowdRpthourlistClass 
 * 
 * 广告主定向分时数据查询，支持广告主查询最近90天内某一天的定向维度分时报表数据
 * 文档：hhttps://open.taobao.com/API.htm?docId=43478&docType=2
 * 
 * */

import { ApiClass } from "./api.class";
import { ApiInterface } from "./api.interface";

export class TaobaoFeedflowItemCrowdRpthourlistClass extends ApiClass implements ApiInterface {
    constructor(){
        super();
    }
    // 接口名称
    public api = 'taobao.feedflow.item.crowd.rpthourlist';
    // 响应参数
    public reponse:any | undefined;
    // 构造的数据结构
    public request:{
        campaign_id:number,
        end_hour_id:number,
        adgroup_id:number,
        crowd_id:number,
        log_date:string,
        start_hour_id:number,
    } | undefined;

    /**
     * 设置请求参数
     */
    public setRequest(request:{
        campaign_id:number,
        end_hour_id:number,
        adgroup_id:number,
        crowd_id:number,
        log_date:string,
        start_hour_id:number,
    }):void {
        console.log('setRequest');
    }
    
    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            // 请求数据
            this.reponse = [
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
        }
        return this.reponse;
    }
}