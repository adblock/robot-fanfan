/*
 * @Author: xingchen
 * @Date: 2021-06-24 14:14:26
 * @LastEditTime: 2021-06-24 15:51:42
 * @Description: 分页查询定向标签列表:https://open.taobao.com/api.htm?docId=43245&docType=2&source=search
 */

import { saveApiToMongodata } from "../api.func";
import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemOptionPageClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        label_query:{
            target_id:Number,
            target_type:String,
            item_id_list:Number[],
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
    public api = 'taobao.feedflow.item.option.page';

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
                await saveApiToMongodata(tmpRequest);
                
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111');
            });
        }
        return this.reponse;
    }
}
