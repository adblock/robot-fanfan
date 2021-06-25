/*
 * @Author: xingchen
 * @Date: 2021-06-16 11:49:19
 * @LastEditTime: 2021-06-25 09:51:45
 * @Description: 
 */
/**
 * TaobaoFeedflowItemCrowdPageClass
 * 
 * 分页查询单品单元下人群列表 ，处理策略传入的数据构造成，接口文档要求的数据结构
 * 文档：https://open.taobao.com/API.htm?docId=43247&docType=2
 * 
 * */

import { saveApiToMongodata } from "../api.func";
import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemCrowdPageClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        crowd_query: {
            adgroup_id:number,
            // status_list:string[]
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
    public api = 'taobao.feedflow.item.crowd.page'; //taobao.feedflow.item.crowd.page

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            let tmpRequest = { 
                requests:this.request,
                data:'',
                apiName:this.api,
                wangwang:this.wangwang,
            }
            this.reponse = this.execute(this.request,this.wangwang).then(async function (res) {
                tmpRequest.data = res
                await saveApiToMongodata(tmpRequest); //TODO 此处可去掉，暂时做log用
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111');
            });
        }
        return this.reponse;
    }
}
