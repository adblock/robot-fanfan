/*
@File     ：taobao.simba.keywordsbyadgroupid.get.class.py
@Author   : xingchen
@Date     ：2021/6/17 13:40 
@describe ：https://open.taobao.com/api.htm?docId=21682&docType=2&source=search 取得一个推广组的所有关键词
*/

import {ZhitongcheApiClass} from "./zhitongche.api.class";
import {ApiInterface} from "../api.interface";

export class TaobaoSimbaKeywordsbyadgroupidGetClass  extends ZhitongcheApiClass implements ApiInterface {
    constructor(request:{
        adgroup_id:number,
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
    public api = 'taobao.httpdns.get'; // taobao.simba.keywordsbyadgroupid.get

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public async getResponse(){
        if(this.reponse === undefined){
            const cache = await this.redisClient.getCache(this.request);
            if(cache){
                this.reponse = cache;
            }else {
                this.reponse = await this.execute(this.request, this.wangwang);
                // 仿造的数据
                this.reponse = {
                    "simba_keywordsbyadgroupid_get_response":{
                        "keywords":{
                            "keyword":[
                                {
                                    "nick":"tbtest561",
                                    "campaign_id":123333,
                                    "adgroup_id":2233333,
                                    "keyword_id":323333, //关键词id
                                    "word":"iphone",
                                    "max_price":2000, //出价
                                    "is_default_price":false,
                                    "audit_status":"audit_pass",
                                    "audit_desc":"包含非法词",
                                    "is_garbage":false,
                                    "create_time":"2000-01-01 00:00:00",
                                    "modified_time":"2000-01-01 00:00:00",
                                    "qscore":"10000",
                                    "match_scope":"4",
                                    "mobile_is_default_price":0,
                                    "max_mobile_price":375
                                },
                                {
                                    "nick":"tbtest561",
                                    "campaign_id":123333,
                                    "adgroup_id":2233333,
                                    "keyword_id":324444, //关键词id
                                    "word":"iphone",
                                    "max_price":1500, //出价
                                    "is_default_price":false,
                                    "audit_status":"audit_pass",
                                    "audit_desc":"包含非法词",
                                    "is_garbage":false,
                                    "create_time":"2000-01-01 00:00:00",
                                    "modified_time":"2000-01-01 00:00:00",
                                    "qscore":"10000",
                                    "match_scope":"4",
                                    "mobile_is_default_price":0,
                                    "max_mobile_price":375
                                },
                                {
                                    "nick":"tbtest561",
                                    "campaign_id":123333,
                                    "adgroup_id":2233333,
                                    "keyword_id":325555, //关键词id
                                    "word":"iphone",
                                    "max_price":1000, //出价,单位是分
                                    "is_default_price":false,
                                    "audit_status":"audit_pass",
                                    "audit_desc":"包含非法词",
                                    "is_garbage":false,
                                    "create_time":"2000-01-01 00:00:00",
                                    "modified_time":"2000-01-01 00:00:00",
                                    "qscore":"10000",
                                    "match_scope":"4",
                                    "mobile_is_default_price":0,
                                    "max_mobile_price":375
                                },
                                {
                                    "nick":"tbtest561",
                                    "campaign_id":123333,
                                    "adgroup_id":2233333,
                                    "keyword_id":326666, //关键词id
                                    "word":"iphone",
                                    "max_price":500, //出价
                                    "is_default_price":false,
                                    "audit_status":"audit_pass",
                                    "audit_desc":"包含非法词",
                                    "is_garbage":false,
                                    "create_time":"2000-01-01 00:00:00",
                                    "modified_time":"2000-01-01 00:00:00",
                                    "qscore":"10000",
                                    "match_scope":"4",
                                    "mobile_is_default_price":0,
                                    "max_mobile_price":375
                                }
                            ]
                        }
                    }
                };
                await this.redisClient.setCache(this.request,this.reponse);
            }
        }
        return this.reponse;
    }
}