/**
 * AverageCostStrategyClass 
 * 
 * 人群平均花费策略的实例类，根据传入的数据，筛选数据，计算数据，构造为api类
 * 超级推荐【商品推广】单元分时报表查询
 * 文档：https://open.taobao.com/API.htm?docId=43477&docType=2
 * */

import { StrategyFuncClass } from '../strategy.func.class';
import { StrategyInterface } from '../strategy.interface';
import { ApiInterface } from '../../api/api.interface';
import { TaobaoFeedflowItemCrowdModifyBindClass, TaobaoFeedflowItemCrowdRpthourlistClass } from '../../api';
import _ from 'lodash';
import { TaobaoFeedflowItemCrowdPageClass } from '../../api/tuijian/taobao.feedflow.item.crowd.page';

export class AverageCostStrategyClass implements StrategyInterface {
    // 策略的常量数据
    public strategyData:any | {};

    constructor(
        strategyData : { 
            request: {
                campaign_id:number,
                end_hour_id:number,
                adgroup_id:number,
                crowd_id:number,
                log_date:string,
                start_hour_id:number,
                crowds: {
                    price:number,
                    status:string,
                    crowd_id:number,
                }[],
                crowd_query: {
                    adgroup_id:number,
                    crowd_id:number,
                }[],
            },wangwangid:string,
            total_budget:number,//总预算
        }
    ){
        // 设置策略数据
        this.strategyData = strategyData;
    }

    private fliter(){
        //实例化广告主定向分时数据查询
        const fliterData = new TaobaoFeedflowItemCrowdRpthourlistClass(this.strategyData.request,this.strategyData.wangwangid);

        const result = fliterData.getResponse().then((data:any)=>{
            const fliterData = data.feedflow_item_crowd_rpthourlist_response.result.rpt_list.rpt_result_dto;
            const strategy = new StrategyFuncClass(fliterData);
            const result = strategy
                .fliter([['campaign_id','=',1]])
                .fliter([['click','=',2]])
                .getResult();
            return result
        });
        return result;
    }

    private async crowdPage() {
        // 批量获取人群出价
        const crowdPageData = new TaobaoFeedflowItemCrowdPageClass(this.strategyData.request,this.strategyData.wangwangid)
        //同步获取数据
        const crowdPageResult = await crowdPageData.getResponse() 
        const dataResult = crowdPageResult.feedflow_item_crowd_page_response.result.crowds.crowd_dto;
        // 根据人群id赋予键
        const result = _.keyBy(dataResult, 'crowd_id');
        return result
    }


    public zhushi():void{
        //这里是思路
        //预算、计划->人群、消耗、时间 、
        /**
         * 需求：单位时间内将预算均匀花出
         * 实现：
         *      1、
         *      2、
         * 
         * 假设：
         *      有10个人群，早上7点第一次跑，总预算1000块，假设0-7点没有任何消耗
         *      所以每个人群一天的平均花费是100块，则每十分钟是100/24/6 = 0.64
         *      7-8点之间，有5个人群没有消耗,有三个人群消耗2.5元，有一个人群消耗50元，有一个人群消耗110元
         * 问题：
         *      8点跑的时候，该怎么算？如何防止超出花费？
         */

    }


    private async adjuster (fliterDataResult:any){
        //计算数据看是否需要更改
        const result =  fliterDataResult.then(async (fliterData:any)=>{
            // 获取人群数组的个数
            // const fliterDataCount = data.length
            const fliterDataCount = 10
            // 计算人群平均花费 = 总预算/人群数量
            const crowdAverageCost = _.round(_.divide(this.strategyData.total_budget, fliterDataCount),2)
            // 批量获取人群出价
            const crowdPageResult = await this.crowdPage()
            // 定义一个最终返回的数组
            let endResult:any[] = [];

            // 循环判断人群花费是否超额
            fliterData.forEach( (filter:any,key:number,fliterData:[])=>{
                if(!(filter.crowd_id in crowdPageResult)){
                    //定义没有数据时的promise对象
                    let erro = new Promise((resolve, reject) => {
                        resolve(
                            {
                                feedflow_item_crowd_modifybind_response: 
                                { result: 
                                    {
                                        mseage: '没有数据就这样吧',
                                        error: false
                                    } 
                                } 
                            }
                        )
                    })

                    // 压入数组跳出循环
                    return endResult.unshift(erro)
                }

                // 定义初始出价
                let  price = 0 
                if(filter.charge > crowdAverageCost){
                    //减价
                    price = crowdPageResult[filter.crowd_id].price - 1   
                }else{
                    //加价
                    price = crowdPageResult[filter.crowd_id].price + 1
                }
                //拼凑需要修改的数据
                let request = {
                    crowds: [{
                        price : price ,
                        status : 'start',
                        crowd_id : filter.crowd_id,
                    }],
                    adgroup_id: 1
                }
                //修改数据
                const adjusterData = new TaobaoFeedflowItemCrowdModifyBindClass(request,this.strategyData.wangwangid)
                const adjusterResult = adjusterData.getResponse()
                //结果压入数组
                return endResult.unshift(adjusterResult)
            });
            // 返回结果
            return endResult
        });
        
        return result;
    }

    // 计算的方法，返回CrowdsModifyBindAdjusterClass
    // public handle():Promise<ApiInterface>{
    public handle():void{
        // 获取人群数据筛选出结果数据,返回的仍然是个promise对象
        const fliterDataResult   = this.fliter();
        fliterDataResult.then((data:any)=>{
            //如果数据为空 不做处理
            if(_.isEmpty(data)){
                console.log('数据不满足条件不做处理')
            }else{
                const adjusterDataResult = this.adjuster(fliterDataResult);
                adjusterDataResult.then((adjusterData:any)=>{
                    // console.log(adjusterData)
                    adjusterData.every((adjusterValue:any,adjusterKey:number,adjusterData:[])=>{
                        adjusterValue.then(function(data:any){
                            console.log(data)
                        })
                        // console.log(adjusterValue)
                        return true;
                    })
                })
            }
        })
        // return fliterDataResult;
    }
}

