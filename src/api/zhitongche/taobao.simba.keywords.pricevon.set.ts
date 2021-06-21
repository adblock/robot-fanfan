/*
@File     ：taobao.simba.keywords.pricevon.set.py
@Author   ：qingyang
@Date     ：2021/5/25 11:55 
@describe ：设置一批关键词的信息( 修改出价 )
            文档：https://open.taobao.com/api.htm?docId=21685&docType=2&source=search
*/
import { ZhitongcheApiClass } from "./zhitongche.api.class";
import { ApiInterface } from "../api.interface";

export class TaobaoSimbaKeywordsPricevonSet extends ZhitongcheApiClass implements ApiInterface{
    constructor(request:{
        keywordId:number,//关键词id
        maxPrice:number,//出价,以分为单位
    }[], wangwang:string){
        super();
        this.request = request;
        this.wangwang = wangwang;
    }

    // 请求此接口的参数变量
    public request;

    // 店铺wangwang
    public wangwang;

    // 接口名称
    public api = 'taobao.httpdns.get'; // taobao.simba.keywords.pricevon.set

    // 响应参数
    public reponse:any | undefined;

    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            this.reponse = this.execute(JSON.stringify(this.request), this.wangwang).then(function (res:any) {
                res = {
                    "simba_keywords_pricevon_set_response":{
                        "keywords":{
                            "keyword":[
                                {
                                    "nick":"tbtest561",
                                    "campaign_id":1489161932,
                                    "adgroup_id":132443,
                                    "keyword_id":135255,
                                    "word":"iphone",
                                    "max_price":500,
                                    "is_default_price":false,
                                    "audit_status":"audit_pass",
                                    "audit_desc":"包含非法词",
                                    "is_garbage":false,
                                    "create_time":"2000-01-01 00:00:00",
                                    "modified_time":"2000-01-01 00:00:00",
                                    "match_scope":"4",
                                    "mobile_is_default_price":0,
                                    "max_mobile_price":375
                                }
                            ]
                        }
                    }
                };
                return res;
            }).catch(data=>{
                console.log(data.code);
            });
        }
        return this.reponse;
    }
}
