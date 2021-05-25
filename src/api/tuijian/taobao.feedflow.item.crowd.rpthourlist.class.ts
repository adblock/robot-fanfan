/**
 * TaobaoFeedflowItemCrowdRpthourlistClass 
 * 
 * 广告主定向分时数据查询，支持广告主查询最近90天内某一天的定向维度分时报表数据
 * 文档：hhttps://open.taobao.com/API.htm?docId=43478&docType=2
 * 
 * */

import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemCrowdRpthourlistClass extends TuijianApiClass implements ApiInterface {
    constructor(){
        super();
    }
    // 接口名称
    public api = 'taobao.httpdns.get'; // taobao.feedflow.item.crowd.rpthourlist
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
            this.reponse = this.execute({test:11111}).then(function (res) {
                // console.log('1--------------------------------------');
                // console.log(res);
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111111');
            });
        }
        return this.reponse;
    }
}
