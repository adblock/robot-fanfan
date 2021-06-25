/*
 * @Author: xingchen
 * @Date: 2021-06-24 14:14:26
 * @LastEditTime: 2021-06-24 15:04:25
 * @Description:  查询单元列表:https://open.taobao.com/api.htm?docId=43323&docType=2&source=search
 */

import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemAdgroupPageClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        adgroup_query:{
            adgroup_id_list:Number[],
            campaign_id_list:Number[],
        };
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
    public api = 'taobao.feedflow.item.adgroup.page';

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            this.reponse = this.execute(this.request,this.wangwang).then(function (res) {
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111');
            });
        }
        return this.reponse;
    }
}
