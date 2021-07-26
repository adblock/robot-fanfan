/*
 * @Author: xingchen
 * @Date: 2021-07-12 11:49:19
 * @LastEditTime: 2021-07-12 14:54:05
 * @Description: 
 */
/**
 * TaobaoFeedflowItemCampaignGetClass
 * 
 * 通过计划id查询计划 
 * 文档：https://open.taobao.com/API.htm?docId=43276&docType=2
 * 
 * */

import { saveApiToMongodata } from "../api.func";
import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemCampaignGetClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        campagin_id:number,
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
    public api = 'taobao.feedflow.item.campaign.get'; //taobao.feedflow.item.crowd.page

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            this.reponse = this.execute(this.request,this.wangwang).then(async function (res) {
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111');
            });
        }
        return this.reponse;
    }
}
