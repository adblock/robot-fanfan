/*
 * @Author: xingchen
 * @Date: 2021-06-08 10:36:44
 * @LastEditTime: 2021-07-15 11:12:42
 * @Description: 
 */
/**
 * TaobaoFeedflowItemCampaignRpthourlistClass 
 * 
 * 广告主推广计划分时数据查询，支持广告主查询最近90天内某一天的计划维度分时报表数据
 * 文档：https://open.taobao.com/API.htm?docId=43478&docType=2
 * 
 * */

import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";
import {saveApiToMongodata, getApiFormMongoByDiffTime} from "../api.func";
import { arMA } from "date-fns/locale";

export class TaobaoFeedflowItemCampaignRpthourlistClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        campaign_id:number,
        end_hour_id:number,
        log_date:string,
        start_hour_id:number,
    }, wangwang:string){
        super();
        this.request = request;
        this.wangwang = wangwang;
    }
    // 请求此接口的参数变量
    public request;

    // 店铺wangwang
    public wangwang;

    // 接口名称
    public api = 'taobao.feedflow.item.campaign.rpthourlist'; // taobao.feedflow.item.crowd.rpthourlist

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            let executeParams = {//重新构造接口参数
                rpt_query:this.request
            }
            this.reponse = this.execute(executeParams, this.wangwang).then(async function (res) {
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111111');
            });
        }
        return this.reponse;
    }
}