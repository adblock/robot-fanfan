/*
@File     ：average.cost.strategy.class.py
@Author   ：qingyang
@Date     ：2021/5/25 13:47 
@describe ： 人群平均花费策略的实例类，根据传入的数据，筛选数据，计算数据，构造为api类
            文档：https://open.taobao.com/api.htm?docId=21685&docType=2&source=search
                 https://open.taobao.com/api.htm?docId=25052&docType=2&source=search
*/

import { StrategyInterface } from "../strategy.interface";
import { ApiInterface } from "../../api/api.interface";


export class ZtcAverageCostStrategyClass implements StrategyInterface{
    // 策略的常量数据
    public strategyData:any | {};
    // 需要筛选的数据
    public fliterData:any | undefined;
    // 最终调整的结果
    public adjusteData:any | undefined;

    constructor(
            strategyData:any,
            fliterData:ApiInterface,
            adjusteData:ApiInterface,
        ){
        // 设置策略数据
        this.strategyData = strategyData;
        // 设置策略数据
        this.fliterData = fliterData;
        // 结果
        this.adjusteData = adjusteData;
    }

    private fliter(fliterData:any){
        const result = fliterData.getResponse().then((data:any)=>{
            console.log(data);
            console.log(this.strategyData.test, 'testtttttt');
            console.log(data['simba_rtrpt_bidword_get_response']['results']['rt_rpt_result_entity_d_t_o']);
            console.log('aaaaaaa');
            return data;
        });
        return result;
    }

    private adjuster (fliterDataResult:any){
        const result = fliterDataResult.then((data:any)=>{
            // console.log(data,2);
            this.adjusteData.setRequest({
                keywordid_prices: '[{"keywordId":"111111","maxPrice":12,"maxMobilePrice":13,"matchScope":4}]'
            })
            return this.adjusteData.getResponse()
        });
        return result;
    }

    // 计算的方法，返回CrowdsModifyBindAdjusterClass
    public handle():Promise<ApiInterface>{
        // 获取人群数据筛选出结果数据
        const fliterDataResult   = this.fliter(this.fliterData);
        // 根据筛选结果，声明更改数据的接口对象
        const adjusterDataResult = this.adjuster(fliterDataResult);
        adjusterDataResult.then(function (data:any) {
            // console.log(new Date());
            // console.log(data.httpdns_get_response.request_id);
        });
        // 请求数据
        return adjusterDataResult;
    }
}
