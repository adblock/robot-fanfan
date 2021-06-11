/**
 * TaobaoFeedflowItemCrowdPageClass
 * 
 * 分页查询单品单元下人群列表 ，处理策略传入的数据构造成，接口文档要求的数据结构
 * 文档：https://open.taobao.com/API.htm?docId=43252&docType=2
 * 
 * */

import { ApiInterface } from "../api.interface";
import {TuijianApiClass} from "./tuijian.api.class";

export class TaobaoFeedflowItemCrowdPageClass extends TuijianApiClass implements ApiInterface {
    constructor(request:{
        crowd_query: {
            adgroup_id:number,
            crowd_id:number,
        }[];  
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
    public api = 'taobao.httpdns.get'; //taobao.feedflow.item.crowd.page

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            this.reponse = this.execute(this.request,this.wangwang).then(function (res) {
                // console.log('2--------------------------------------');
                // console.log(res);
                res = {
                    "feedflow_item_crowd_page_response":{
                        "result":{
                            "message":"message",
                            "crowds":{
                                "crowd_dto":[
                                    {
                                        "crowd_id":123,
                                        "crowd_name":"test",
                                        "crowd_desc":"test",
                                        "price":100,
                                        "campaign_id":1,
                                        "adgroup_id":1,
                                        "status":"start",
                                        "target_label":{
                                            "label_id":1,
                                            "target_id":1,
                                            "target_type":"ITEM_RECOMMEND",
                                            "label_name":"test",
                                            "label_desc":"test",
                                            "label_value":"ALL",
                                            "options":{
                                                "option_dto":[
                                                    {
                                                        "option_name":"test",
                                                        "option_value":"ALL",
                                                        "option_desc":"test"
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        "crowd_id":456,
                                        "crowd_name":"test",
                                        "crowd_desc":"test",
                                        "price":100,
                                        "campaign_id":1,
                                        "adgroup_id":1,
                                        "status":"start",
                                        "target_label":{
                                            "label_id":1,
                                            "target_id":1,
                                            "target_type":"ITEM_RECOMMEND",
                                            "label_name":"test",
                                            "label_desc":"test",
                                            "label_value":"ALL",
                                            "options":{
                                                "option_dto":[
                                                    {
                                                        "option_name":"test",
                                                        "option_value":"ALL",
                                                        "option_desc":"test"
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            },
                            "total_count":100,
                            "success":true
                        }
                    }
                }
                return res;
            }).catch(data=>{
                console.log(data.code,'11111111');
            });
        }
        return this.reponse;
    }
}
