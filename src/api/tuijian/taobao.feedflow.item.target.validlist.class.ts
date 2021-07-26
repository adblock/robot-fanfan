/*
 * @Author: xingchen
 * @Date: 2021-06-24 14:14:26
 * @LastEditTime: 2021-06-24 14:18:01
 * @Description: 获取有权限的定向列表:https://open.taobao.com/api.htm?docId=43246&docType=2&source=search
 */

import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemTargetValidlistClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        campaign_id:number
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
    public api = 'taobao.feedflow.item.target.validlist';

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
