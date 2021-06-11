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
        // 此处的参数没有这么多，//TODO 有些参数后续需要计算
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

    /**
     * 获取计划对应的人群定向分时数据
     * @returns 
     */
    private fliter(){
        //实例化广告主定向分时数据查询
        const fliterData = new TaobaoFeedflowItemCrowdRpthourlistClass(this.strategyData.request,this.strategyData.wangwangid);

        const result = fliterData.getResponse().then((data:any)=>{
            const fliterData = data.feedflow_item_crowd_rpthourlist_response.result.rpt_list.rpt_result_dto;
            const strategy = new StrategyFuncClass(fliterData);
            const result = strategy //此处为处理过滤（如果没有需要过滤内容，可直接返回上面的fliterData）
                .fliter([['campaign_id','=',1]])
                .fliter([['click','=',2]])
                .getResult();
             
            // console.log(result)

            return result;
        });
        return result;
    }

    /**
     * 获取单品单元下人群列表，只获取投放中的
     * @returns 
     */
    private async crowdPage() {
        // 批量获取人群出价
        const crowdPageData = new TaobaoFeedflowItemCrowdPageClass(this.strategyData.request,this.strategyData.wangwangid);
        //同步获取数据，为了给下面的数据赋予人群id的键
        const crowdPageResult = await crowdPageData.getResponse();
        const dataResult = crowdPageResult.feedflow_item_crowd_page_response.result.crowds.crowd_dto;
        // 根据人群id赋予键
        const result = _.keyBy(dataResult, 'crowd_id');
        return result;
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
            // 获取人群数组的个数 //TODO 暂定为10个
            // const fliterDataCount = data.length
            const fliterDataCount = 10; 
            // 计算人群平均花费 = 总预算/人群数量 //TODO 上传的total_budget单位待确认（暂定为分）
            const crowdAverageCost = _.round(_.divide(this.strategyData.total_budget, fliterDataCount),2);
            // 批量获取人群出价
            const crowdPageResult = await this.crowdPage();
            // 定义一个最终返回的数组
            let endResult:any[] = [];

            // 循环判断人群花费是否超额
            fliterData.forEach( (filter:any,key:number,fliterData:[])=>{
                if(!(filter.crowd_id in crowdPageResult)){
                    //如果没有当前人群的出价，说明是非投放中，则不作处理
                    //定义没有数据时的promise对象
                    let erro = new Promise((resolve, reject) => {
                        resolve(
                            {
                                feedflow_item_crowd_modifybind_response: 
                                { result: 
                                    {
                                        mseage: '人群未投放',
                                        error: false
                                    } 
                                } 
                            }
                        );
                    });

                    // 压入数组 return跳出循环
                    return endResult.unshift(erro);
                }
               
                let  price:number = 0;  // 定义初始出价
                let  status:string = 'start'; // 定义初始状态
                let  price_range:number = 0.02; // 调价幅度，相当于百分之二
                let  last_charge:number = 100; // TODO 上次花费 需要查询数据库 ，单位此处暂时假设为元

                //消耗单位是元，上次消耗为元 当前出价为分，平均出价为元，最终出价为分
                if(filter.charge*100 > crowdAverageCost){
                    //消耗大于日限均值,直接暂停
                    status = 'pause'; //接口未体现，可能是其他的
                    price = crowdPageResult[filter.crowd_id].price;//出价不变 
                }else{
                    //消耗小于人群平均日限
                    if(filter.charge > last_charge){
                        //当前时刻较上次（也可能是过去的某个时间点）消耗未变,出价上调
                        price = _.multiply(crowdPageResult[filter.crowd_id].price, (1 + price_range)); 
                    }else{
                        //当前时刻较上次（也可能是过去的某个时间点）消耗上升,出价不变
                        price = crowdPageResult[filter.crowd_id].price;//出价不变   
                    }
                    
                }
                //拼凑需要修改的数据
                let request = {
                    crowds: [{
                        price : price ,
                        status : status,
                        crowd_id : filter.crowd_id,
                    }],
                    adgroup_id: 1
                }
                //修改数据
                const adjusterData = new TaobaoFeedflowItemCrowdModifyBindClass(request,this.strategyData.wangwangid);
                const adjusterResult = adjusterData.getResponse();
                //结果压入数组
                return endResult.unshift(adjusterResult);
            });
            // 返回结果
            return endResult;
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
                console.log('数据不满足条件不做处理');
            }else{
                const adjusterDataResult = this.adjuster(fliterDataResult);
        //         adjusterDataResult.then((adjusterData:any)=>{
        //             // console.log(adjusterData)
        //             adjusterData.every((adjusterValue:any,adjusterKey:number,adjusterData:[])=>{
        //                 adjusterValue.then(function(data:any){
        //                     console.log(data);
        //                 })
        //                 // console.log(adjusterValue)
        //                 return true;
        //             })
        //         })
            }
        })
        // return fliterDataResult;
    }
}

