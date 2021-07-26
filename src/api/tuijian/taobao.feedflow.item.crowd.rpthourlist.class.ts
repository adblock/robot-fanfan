/*
 * @Author: xingchen
 * @Date: 2021-06-08 10:36:44
 * @LastEditTime: 2021-07-13 09:44:12
 * @Description: 
 */
/**
 * TaobaoFeedflowItemCrowdRpthourlistClass 
 * 
 * 广告主定向分时数据查询，支持广告主查询最近90天内某一天的定向维度分时报表数据
 * 文档：https://open.taobao.com/API.htm?docId=43478&docType=2
 * 
 * */

import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";
import {saveApiToMongodata, getApiFormMongoByDiffTime} from "../api.func";
import { arMA } from "date-fns/locale";

export class TaobaoFeedflowItemCrowdRpthourlistClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        campaign_id:number,
        end_hour_id:number,
        adgroup_id:number,
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
    // public api = 'taobao.httpdns.get'; // taobao.feedflow.item.crowd.rpthourlist
    public api = 'taobao.feedflow.item.crowd.rpthourlist'; // taobao.feedflow.item.crowd.rpthourlist

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            //构造临时数据结构
            let tmpRequest = { 
                requests:this.request,
                data:'',
                apiName:this.api,
                wangwang:this.wangwang,
            }
            let executeParams = {//重新构造接口参数
                rpt_query:this.request
            }
            this.reponse = this.execute(executeParams, this.wangwang).then(async function (res) {
                // 存储数据的到Mongo
                tmpRequest.data = res
                await saveApiToMongodata(tmpRequest);
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111111');
            });
        }
        return this.reponse;
    }
    /**
     * 获取此接口 diffTime 前的最后一条数据 diffTime为分钟
     * @params diffTime number 分钟
     * */
    public async getResponseByDiffTime(diffTime:number,limit:number = 1){
        let tmpRequests = JSON.parse(JSON.stringify(this.request));//数据深拷贝
        delete(tmpRequests.end_hour_id);//去掉多余参数

        return await getApiFormMongoByDiffTime({
            requests:tmpRequests,
            diffTime:diffTime,
            apiName:this.api,
            wangwang:this.wangwang,   
        },limit);
    }
}

// const test = new TaobaoFeedflowItemCrowdRpthourlistClass( {
//     rpt_query:{
//         campaign_id:1,
//         end_hour_id:1,
//         adgroup_id:1,
//         log_date:'2021-06-21',
//         start_hour_id:1,
//     }
// },'121212121');

// test.getResponse();

// test.getResponseByDiffTime(0).then(function (data) {
//     console.log(data);
// });
