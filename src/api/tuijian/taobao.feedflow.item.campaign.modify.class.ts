/*
 * @Author: xingchen
 * @Date: 2021-07-12 11:49:19
 * @LastEditTime: 2021-07-14 17:12:27
 * @Description: 
 */
/**
 * TaobaoFeedflowItemCampaignModifyClass
 * 
 * 通过计划id修改信息流计划
 * 文档：https://open.taobao.com/API.htm?docId=43274&docType=2
 * 
 * */

import { saveApiToMongodata } from "../api.func";
import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemCampaignModifyClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        campaign_id:number,
        status:string
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
    public api = 'taobao.feedflow.item.campaign.modify'; //taobao.feedflow.item.crowd.page

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            let executeParams = {//重新构造接口参数
                campaign:this.request
            }
            this.reponse = this.execute(executeParams,this.wangwang).then(async function (res) {
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111');
            });
        }
        return this.reponse;
    }
}
