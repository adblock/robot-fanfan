/*
@File     ：average.kwy.words.cost.strategy.class.py
@Author   : xingchen
@Date     ：2021/6/17 10:21
@describe ： 关键词平均花费策略的实例类，根据传入的数据，筛选数据，计算数据，构造为api类
            文档：https://open.taobao.com/api.htm?docId=25052&docType=2&source=search
                https://open.taobao.com/api.htm?docId=21685&docType=2&source=search
*/
import _ from 'lodash';
import { StrategyInterface } from '../strategy.interface';
import { TaobaoSimbaRtrptBidwordGetClass, TaobaoSimbaKeywordsbyadgroupidGetClass, TaobaoSimbaKeywordsPricevonSet} from '../../api';
import {format, subMinutes, getHours } from 'date-fns';
import { mongoClient } from '../../libs/mongoClient'

export class AverageKeyWordsCostStrategyClass implements StrategyInterface {
    // 策略的常量数据
    public strategyData:any | {};
    private mongoLogsCollections = 'zhitongche_crowd_adjuster_logs';
    private theLastAdjusterDiffTime = 10; // 与上一次调整的比较时间长度（分钟）
    /**
     * 构造查询参数
     * @param strategyData 用户传入数据
     */
    constructor(
        // 此处的参数没有这么多，//TODO 有些参数后续需要计算
        strategyData : { 
            campaign_id:number,
            adgroup_id:number,
            wangwangid:string,
            total_budget:number,//总预算
        }
    ){
        // 设置策略数据
        this.strategyData = strategyData;
    }

    /**
     * 获取计划和推广组对应的关键词实时数据
     * @returns 
     */
    private async getRptData(){
        //拼凑查询数据
        let requestData = {
            campaign_id : this.strategyData.campaign_id,
            adgroup_id : this.strategyData.adgroup_id,
            the_date : format(new Date(), 'yyyy-MM-dd'),
        };

        // 实例化关键词实时数据
        const RtrptBidwordData = new TaobaoSimbaRtrptBidwordGetClass(requestData,this.strategyData.wangwangid);
        //获取数据
        const result = await RtrptBidwordData.getResponse();
        return  result.simba_rtrpt_bidword_get_response.results.rt_rpt_result_entity_d_t_o;
    }

    /**
     * 获取人群对应的关键词出价
     * @returns 
     */
    private async keywordsBid() {
        //拼接查询参数
        let requestData = {
            adgroup_id: this.strategyData.adgroup_id,
        };
        // 批量获取人群出价
        const keywordsBidData = new TaobaoSimbaKeywordsbyadgroupidGetClass(requestData, this.strategyData.wangwangid);
        //同步获取数据，为了给下面的数据赋予人群id的键
        const keywordsBidResult = await keywordsBidData.getResponse();
        const dataResult = keywordsBidResult.simba_keywordsbyadgroupid_get_response.keywords.keyword;
        // 根据人群id赋予键
        const result = _.keyBy(dataResult, 'keyword_id');
        return result;
    }

    /**
     * 获取单品单元下人群列表，只获取投放中的
     * @returns
     */
    private async getLastCost(bidwordidArr:number[]) {
        //实例化mongo连接
        let mongoClientInstance = mongoClient;
        await mongoClientInstance.getDB();
        //获取上次或过去某个时间点的数据
        let last_cost_arr = await mongoClientInstance.database.collection(this.mongoLogsCollections).aggregate([
            {//查询条件
                $match:{
                    bidwordid : {
                        $in : bidwordidArr
                    }
                }
            }, 
            {//按操作时间降序排序
                $sort:{
                    "date_minute": -1
                }
            },              
            {//数据分组并设置展示的值
                $group:{
                    _id : "$bidwordid",
                    bidwordid : {$first:"$bidwordid"},
                    last_cost : {$first:"$last_cost"},
                    date_minute : {$first:"$date_minute"},
                }
            }
        ]).toArray();

        // 根据人群id赋予键
        last_cost_arr = _.keyBy(last_cost_arr, 'bidwordid');
        return last_cost_arr;
    }

    /**
     * 数据处理并修改数据
     * @param fliterDataResult 获取到的计划下的人群数据
     * @returns 
     */
    private async adjuster (){
        const rptDataResult = await this.getRptData(); // 关键词实时数据
        const keywordsBidResult = await this.keywordsBid(); // 关键词 出价
        console.log(rptDataResult);
        return 123;
        // console.log(keywordsBidResult);
        const lastCostResult = await this.getLastCost(_.map(_.keys(keywordsBidResult), _.parseInt)); // TODO 关键词存储在mongo中的最后一次出价
        const keywordsAverageCost = _.round(_.divide(this.strategyData.total_budget, rptDataResult.length)); // 计算关键词平均花费 = 总预算/关键词数量 //TODO 上传的total_budget单位待确认（暂定为分,如果是元 需要转换）

        // TODO 修改关键词出价接口需要的数据,参数有待商榷
        let pricevonSetRequest:{
            keywordId:number,//关键词id
            maxPrice:number,//出价,以分为单位
        }[] = [];
        // 存储到mongo的数据
        let mongoData:any[] = [];

        // 循环人群实时数据
        rptDataResult.forEach( (filter:any)=>{
            if(!(filter.bidwordid in keywordsBidResult)){
                //如果没有当前人群的出价，说明是非投放中，则不作处理，这种情况基本不会出现
                return; //return 跳出当次循环
            }
            let  maxPrice = 5;  // TODO 定义初始出价,单位为分，这里需要知道是传入还是查询得出
            let  price_range = 0.1; // 调价幅度，相当于百分之十
            let  last_cost = lastCostResult.hasOwnProperty(filter.bidwordid) ? lastCostResult[filter.bidwordid].last_cost : '0'; //上次花费 ，单位为分

            //TODO 消耗单位可能是分 暂定，上次消耗为分 当前出价为分，平均出价为分，最终出价为分
            if(filter.cost <= keywordsAverageCost){
                let last_date_minute = lastCostResult.hasOwnProperty(filter.bidwordid) ? lastCostResult[filter.bidwordid].date_minute : "1970-01-01 00:00"; //上次修改时间
                let ten_before_minute = format(subMinutes(new Date(), this.theLastAdjusterDiffTime), 'yyyy-MM-dd HH:mm'); //过去十分钟的时间点
                if(last_date_minute > ten_before_minute){ //本次时间与上次修改时间不满十分钟
                    return;//未满10分钟 return 跳出当次循环
                }else{
                    if(filter.cost > last_cost){
                        //当前时刻较上次（也可能是过去的某个时间点）消耗上升,出价不变
                        maxPrice = keywordsBidResult[filter.bidwordid].max_price;//出价不变
                    }else{
                        //当前时刻较上次（也可能是过去的某个时间点）消耗未变,出价上调
                        maxPrice = _.multiply(keywordsBidResult[filter.bidwordid].max_price, (1 + price_range));
                    }
                }
            }
            //将拼凑的数据压入最终数组
            pricevonSetRequest.unshift({
                keywordId : filter.bidwordid ,
                maxPrice : maxPrice,
            });

            //将拼凑的数据压入最终数组
            mongoData.unshift({
                bidwordid : filter.bidwordid,
                last_cost : filter.cost, //当作上次花费
                adgroup_id : this.strategyData.adgroup_id,
                wangwangid : this.strategyData.wangwangid,
                date_minute : format(new Date(), 'yyyy-MM-dd HH:mm'), //上次操作时间 精确到分钟
                last_price : maxPrice // 当作上次出价 （可能不需要，因为会查询淘宝api）
            });
        });
        if(pricevonSetRequest.length){
            //有数据、修改数据
            const adjusterData = new TaobaoSimbaKeywordsPricevonSet(pricevonSetRequest, this.strategyData.wangwangid);
            const adjusterResult = await adjusterData.getResponse();
        }
        if(mongoData.length > 0){
            //实例化mongo连接
            let mongoClientInstance = mongoClient;
            await mongoClientInstance.getDB();
            //此处将人群id，当前消耗、推广组id，旺旺id、时间（年月日时分）存入mongo
            //批量 插入数据
            await mongoClientInstance.database.collection(this.mongoLogsCollections).insertMany(mongoData);
            await mongoClientInstance.mongoClose();
        }
        return 1;
    }

    public handle():void{
        // 获取人群数据筛选出结果数据,返回的仍然是个promise对象
        const adjuster = this.adjuster();
        adjuster.then(function (data) {
             console.log(data);
        });
    }
}

const strategyData  =  {
    campaign_id:2,
    adgroup_id:2,
    wangwangid:'这是个测试',
    total_budget:230000 //单位是分
};

const test = new AverageKeyWordsCostStrategyClass(strategyData);
test.handle();
