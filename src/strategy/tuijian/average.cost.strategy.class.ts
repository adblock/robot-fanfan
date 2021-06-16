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
import {format,subMinutes} from 'date-fns';
import { mongoClient } from '../../libs/mongoClient'

export class AverageCostStrategyClass implements StrategyInterface {
    // 策略的常量数据
    public strategyData:any | {};

    /**
     * 构造查询参数
     * @param strategyData 用户传入数据
     */
    constructor(
        // 此处的参数没有这么多，//TODO 有些参数后续需要计算
        strategyData : { 
            campaign_id:number,
            adgroup_id:number,
            start_hour_id:number, 
            end_hour_id:number,
            log_date:string,
            wangwangid:string,
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
        //拼凑查询数据
        let requestData = {
            campaign_id : this.strategyData.campaign_id,
            end_hour_id : this.strategyData.end_hour_id,
            adgroup_id : this.strategyData.adgroup_id,
            log_date : this.strategyData.log_date,
            start_hour_id : this.strategyData.start_hour_id,
        }
        //实例化广告主定向分时数据查询
        const fliterData = new TaobaoFeedflowItemCrowdRpthourlistClass(requestData,this.strategyData.wangwangid);
        
        //获取数据
        const result = fliterData.getResponse().then((data:any)=>{
            const fliterData = data.feedflow_item_crowd_rpthourlist_response.result.rpt_list.rpt_result_dto;
            const strategy = new StrategyFuncClass(fliterData);
            const result = strategy //此处为处理过滤（如果没有需要过滤内容，可直接返回上面的fliterData）
                .fliter([['campaign_id','=',1]])
                .fliter([['click','=',2]])
                .getResult();

            return result;
        });
        return result;
    }

    /**
     * 获取单品单元下人群列表，只获取投放中的
     * @returns 
     */
    private async crowdPage() {
        //拼接查询参数
        let requestData = {
            crowd_query : [
                {
                    adgroup_id: this.strategyData.adgroup_id,
                    status_list : ['start'] //只获取投放中的的
                }
            ]
        }
    
        // 批量获取人群出价
        const crowdPageData = new TaobaoFeedflowItemCrowdPageClass(requestData,this.strategyData.wangwangid);
        //同步获取数据，为了给下面的数据赋予人群id的键
        const crowdPageResult = await crowdPageData.getResponse();
        const dataResult = crowdPageResult.feedflow_item_crowd_page_response.result.crowds.crowd_dto;
        // 根据人群id赋予键
        const result = _.keyBy(dataResult, 'crowd_id');
        return result;
    }

    /**
     * 数据处理并修改数据
     * @param fliterDataResult 获取到的计划下的人群数据
     * @returns 
     */
    private async adjuster (fliterDataResult:any){
        //计算数据看是否需要更改
        const result =  fliterDataResult.then(async (fliterData:any)=>{
            // 获取人群数组的个数 //TODO 暂定为10个
            // const fliterDataCount = data.length
            const fliterDataCount = 10; 
            // 计算人群平均花费 = 总预算/人群数量 //TODO 上传的total_budget单位待确认（暂定为分）
            const crowdAverageCost = _.round(_.divide(this.strategyData.total_budget, fliterDataCount),2);
            // 批量同步获取人群出价
            const crowdPageResult = await this.crowdPage();

            // 定义一个最终返回的结果数组
            let endResult:any[] = [];

            //定义最后需要修改的数据数组
            let request : {
                crowds : any[],
                adgroup_id : number,
            } = {
                crowds : [],
                adgroup_id : this.strategyData.adgroup_id,
            }

            // 定义存入mongo的数组
            let mongoData:any[] = [];

            //实例化mongo连接
            let mongoClientInstance = mongoClient; 
            await mongoClientInstance.getDB();

            //获取上次或过去某个时间点的数据
            let last_charge_arr = await mongoClientInstance.database.collection('ddd_test').find({
                // adgroup_id : this.strategyData.adgroup_id,// TODO 人群
                wangwangid : this.strategyData.wangwangid,//旺旺
                // date_minute : format(subMinutes(new Date(), 2), 'yyyy-MM-dd hh:mm') // TODO 过去某个时间点
            }).toArray();
            // 根据人群id赋予键
            last_charge_arr = _.keyBy(last_charge_arr, 'crowd_id');

            // 循环判断人群花费是否超额
            fliterData.forEach( (filter:any,key:number,fliterData:[])=>{
                if(!(filter.crowd_id in crowdPageResult)){
                    //如果没有当前人群的出价，说明是非投放中，则不作处理
                   return; //return 跳出当次循环
                }
               
                let  price:number = 0;  // 定义初始出价
                let  status:string = 'start'; // 定义初始状态
                let  price_range:number = 0.02; // 调价幅度，相当于百分之二
                let  last_charge = last_charge_arr.hasOwnProperty(filter.crowd_id) ? last_charge_arr[filter.crowd_id].last_charge : '0' ;//上次花费 ，单位为元

                //消耗单位是元，上次消耗为元 当前出价为分，平均出价为分，最终出价为分
                if(filter.charge*100 > crowdAverageCost){
                    //消耗大于日限均值,直接暂停
                    status = 'pause'; //接口未体现暂停时pause，可能是其他的
                    price = crowdPageResult[filter.crowd_id].price;//出价不变 
                }else{
                    //消耗小于人群平均日限
                    if(filter.charge > last_charge){
                        //当前时刻较上次（也可能是过去的某个时间点）消耗上升,出价不变
                        price = crowdPageResult[filter.crowd_id].price;//出价不变   
                    }else{
                        //当前时刻较上次（也可能是过去的某个时间点）消耗未变,出价上调
                        price = _.multiply(crowdPageResult[filter.crowd_id].price, (1 + price_range)); 
                    }
                }

                //拼凑需要修改的数据
                let tmpRequest = {
                    price : price ,
                    status : status,
                    crowd_id : filter.crowd_id,
                }
                //将拼凑的数据压入最终数组
                request.crowds.unshift(tmpRequest);
                
                //拼凑需要存入mongo的数据
                let tmpMongo = {
                    crowd_id : filter.crowd_id,
                    last_charge : filter.charge, //当作上次花费
                    adgroup_id : this.strategyData.adgroup_id,
                    wangwangid : this.strategyData.wangwangid,
                    date_minute : format(new Date(), 'yyyy-MM-dd hh:mm'), //上次操作时间 精确到分钟
                    status : status, //保存好状态，以后查询可能用到
                    last_price: price // 当作上次出价 （可能不需要，因为会查询淘宝api）
                }
                //将拼凑的数据压入最终数组
                mongoData.unshift(tmpMongo);
            });

            if(request.crowds.length){
                //有数据、修改数据
                const adjusterData = new TaobaoFeedflowItemCrowdModifyBindClass(request,this.strategyData.wangwangid);
                const adjusterResult = adjusterData.getResponse();
                //结果压入数组
                endResult.unshift(adjusterResult);
            }else{
                //没有数据，定义没有数据时的promise对象
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
                // 压入数组
                endResult.unshift(erro);
            }

            if(mongoData.length > 0){
                //此处将人群id，当前消耗、推广组id，旺旺id、时间（年月日时分）存入mongo
                //批量 插入数据
                await mongoClientInstance.database.collection('ddd_test').insertMany(mongoData)
                await mongoClientInstance.mongoClose()
            }

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
                adjusterDataResult.then((adjusterData:any)=>{
                    //TODO 打印结果 此处可以删掉
                    adjusterData.every((adjusterValue:any,adjusterKey:number,adjusterData:[])=>{
                        adjusterValue.then(function(data:any){
                            console.log(data);
                        })
                        //需要返回true以让循环继续执行
                        return true; 
                    })
                })
            }
        })
        // return fliterDataResult;
    }
}

