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
                                    "cartTotal":"192",
                                    "campaignId":"6797488",
                                    "indirectTransaction":"58450",
                                    "adgroupId":"2491036387",
                                    "mechanism":"0",
                                    "click":"1277",
                                    "directTransaction":"361870",
                                    "transactionShippingTotal":"236",
                                    "favShopTotal":"0",
                                    "indirectCartTotal":"25",
                                    "cpc":"170.4738",
                                    "directTransactionShipping":"215",
                                    "ctr":"11.4581",
                                    "custId":"1104081544",
                                    "cpm":"19532.9744",
                                    "impression":"11145",
                                    "favItemTotal":"23",
                                    "directCartTotal":"167",
                                    "hour":"0",
                                    "cost":"217695",
                                    "indirectTransactionShipping":"21",
                                    "trafficType":"4",
                                    "creativeId":"2495224439",
                                    "theDate":"2021-05-25",
                                    "coverage":"18.4808",
                                    "roi":"1.9308",
                                    "transactionTotal":"420320",
                                    "favTotal":"23"
                                },
                                {
                                    "cartTotal":"90",
                                    "campaignId":"8055626",
                                    "indirectTransaction":"6450",
                                    "adgroupId":"2541327874",
                                    "mechanism":"0",
                                    "click":"447",
                                    "directTransaction":"90480",
                                    "transactionShippingTotal":"50",
                                    "favShopTotal":"0",
                                    "indirectCartTotal":"9",
                                    "cpc":"177.6890",
                                    "directTransactionShipping":"47",
                                    "ctr":"8.8288",
                                    "custId":"1104081544",
                                    "cpm":"15687.7345",
                                    "impression":"5063",
                                    "favItemTotal":"6",
                                    "directCartTotal":"81",
                                    "hour":"0",
                                    "cost":"79427",
                                    "indirectTransactionShipping":"3",
                                    "trafficType":"1",
                                    "creativeId":"2545470387",
                                    "theDate":"2021-05-25",
                                    "coverage":"11.1857",
                                    "roi":"1.2204",
                                    "transactionTotal":"96930",
                                    "favTotal":"6"
                                },
                                {
                                    "cartTotal":"121",
                                    "campaignId":"8510642",
                                    "indirectTransaction":"91190",
                                    "adgroupId":"2535517455",
                                    "mechanism":"0",
                                    "click":"667",
                                    "directTransaction":"247200",
                                    "transactionShippingTotal":"56",
                                    "favShopTotal":"0",
                                    "indirectCartTotal":"26",
                                    "cpc":"195.5457",
                                    "directTransactionShipping":"38",
                                    "ctr":"10.2996",
                                    "custId":"1104081544",
                                    "cpm":"20140.3644",
                                    "impression":"6476",
                                    "favItemTotal":"26",
                                    "directCartTotal":"95",
                                    "hour":"0",
                                    "cost":"130429",
                                    "indirectTransactionShipping":"18",
                                    "trafficType":"1",
                                    "creativeId":"2545280172",
                                    "theDate":"2021-05-25",
                                    "coverage":"8.3958",
                                    "roi":"2.5944",
                                    "transactionTotal":"338390",
                                    "favTotal":"26"
                                },
                                {
                                    "cartTotal":"84",
                                    "campaignId":"40085187",
                                    "indirectTransaction":"44870",
                                    "adgroupId":"2491134190",
                                    "mechanism":"0",
                                    "click":"643",
                                    "directTransaction":"154680",
                                    "transactionShippingTotal":"45",
                                    "favShopTotal":"0",
                                    "indirectCartTotal":"11",
                                    "cpc":"124.2364",
                                    "directTransactionShipping":"32",
                                    "ctr":"10.8725",
                                    "custId":"1104081544",
                                    "cpm":"13507.6091",
                                    "impression":"5914",
                                    "favItemTotal":"12",
                                    "directCartTotal":"73",
                                    "hour":"0",
                                    "cost":"79884",
                                    "indirectTransactionShipping":"13",
                                    "trafficType":"4",
                                    "creativeId":"2501592675",
                                    "theDate":"2021-05-25",
                                    "coverage":"6.9984",
                                    "roi":"2.4980",
                                    "transactionTotal":"199550",
                                    "favTotal":"12"
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
