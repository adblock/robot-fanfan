/*
@File     ：taobao.simba.rtrpt.bidword.get.class.py
@Author   ：qingyang
@Date     ：2021/5/25 10:53 
@describe ：获取推广词实时报表数据
            文档： https://open.taobao.com/api.htm?docId=25052&docType=2&source=search
*/

import { ZhitongcheApiClass } from "./zhitongche.api.class";
import { ApiInterface } from "../api.interface";


export class TaobaoSimbaRtrptBidwordGetClass extends ZhitongcheApiClass implements ApiInterface {
    constructor(request:{
        campaign_id:number,
        adgroup_id:number,
        the_date:string,
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
    public api = 'taobao.httpdns.get'; // taobao.simba.rtrpt.bidword.get

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
                    "simba_rtrpt_bidword_get_response":{
                        "results":{
                            "rt_rpt_result_entity_d_t_o":[
                                {
                                    "campaignid":"123333",
                                    "adgroupid":"2233333",
                                    "bidwordid":"323333",
                                    "cost":"100", //TODO 单位貌似是元
                                    "thedate":"2021-06-17"
                                },
                                {
                                    "campaignid":"123333",
                                    "adgroupid":"2233333",
                                    "bidwordid":"324444",
                                    "cost":"23", //TODO 单位貌似是元
                                    "thedate":"2021-06-17"
                                },
                                {
                                    "campaignid":"123333",
                                    "adgroupid":"2233333",
                                    "bidwordid":"325555",
                                    "cost":"90", //TODO 单位貌似是元
                                    "thedate":"2021-06-17"
                                },
                                {
                                    "campaignid":"123333",
                                    "adgroupid":"2233333",
                                    "bidwordid":"326666",
                                    "cost":"80", //TODO 单位貌似是元
                                    "thedate":"2021-06-17"
                                },
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
