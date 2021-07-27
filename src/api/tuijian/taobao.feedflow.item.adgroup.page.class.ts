/*
 * @Author: xingchen
 * @Date: 2021-06-24 14:14:26
 * @LastEditTime: 2021-07-27 10:54:26
 * @Description:  查询单元列表:https://open.taobao.com/api.htm?docId=43323&docType=2&source=search
 */

import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemAdgroupPageClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        campaign_id_list:Number[],
        adgroup_id_list?:Number[],
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
            let executeParams = {//重新构造接口参数
                adgroup_query:this.request
            }
            this.reponse = this.execute(executeParams,this.wangwang).then(function (res) {
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111');
            });
        }
        return this.reponse;
    }
}
