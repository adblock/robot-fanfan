/**
 * TaobaoFeedflowItemCrowdModifyBindClass
 * 
 * 修改人群出价或状态的类，处理策略传入的数据构造成，接口文档要求的数据结构
 * 文档：https://open.taobao.com/API.htm?docId=43252&docType=2
 * 
 * */

import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemCrowdModifyBindClass extends TuijianApiClass implements ApiInterface {
    constructor(
        request:{
            crowds: {
                price:number,
                status:string,
                crowd_id:number,
            }[];
            adgroup_id: number;
        },
        wangwang:string,
        // last_charge:string
    ){
        super();
        this.request = request;
        this.wangwang = wangwang;
        // this.last_charge = last_charge;
    }

    //记录上次花费（实际为当前花费）
    // public last_charge;

    // 请求此接口的参数变量
    public request;

    // 店铺wangwang
    public wangwang;

    // 接口名称
    public api = 'taobao.feedflow.item.crowd.modifybind'; //taobao.feedflow.item.crowd.modifybind

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public async getResponse(){
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
