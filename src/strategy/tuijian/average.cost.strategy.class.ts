/**
 * AverageCostStrategyClass 
 * 
 * 人群平均花费策略的实例类，根据传入的数据，筛选数据，计算数据，构造为api类
 * 超级推荐【商品推广】单元分时报表查询
 * 文档：https://open.taobao.com/API.htm?docId=43477&docType=2
 * */
import _ from 'lodash';
import { StrategyInterface } from '../strategy.interface';
import { TaobaoFeedflowItemCrowdModifyBindClass, TaobaoFeedflowItemCrowdRpthourlistClass, TaobaoFeedflowItemCrowdPageClass } from '../../api';
import {format, subMinutes, getHours } from 'date-fns';
import { mongoClient } from '../../libs/mongoClient'

export class AverageCostStrategyClass implements StrategyInterface {
    // 策略的常量数据
    public strategyData:any | {};
    private mongoLogsCollections = 'tuijian_crowd_adjuster_logs';
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
     * 获取计划对应的人群定向分时数据
     * @returns 
     */
    private async getRptData(){
        //拼凑查询数据
        let requestData = {
            campaign_id : this.strategyData.campaign_id,
            adgroup_id : this.strategyData.adgroup_id,
            log_date : format(new Date(), 'yyyy-MM-dd'),
            start_hour_id : 0,
            end_hour_id : getHours(new Date()),
        };

        // 实例化广告主定向分时数据查询
        const fliterData = new TaobaoFeedflowItemCrowdRpthourlistClass(requestData,this.strategyData.wangwangid);
        //获取数据
        const result = await fliterData.getResponse();
        return  result.feedflow_item_crowd_rpthourlist_response.result.rpt_list.rpt_result_dto;
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
        };
        // 批量获取人群出价
        const crowdPageData = new TaobaoFeedflowItemCrowdPageClass(requestData, this.strategyData.wangwangid);
        //同步获取数据，为了给下面的数据赋予人群id的键
        const crowdPageResult = await crowdPageData.getResponse();
        const dataResult = crowdPageResult.feedflow_item_crowd_page_response.result.crowds.crowd_dto;
        // 根据人群id赋予键
        const result = _.keyBy(dataResult, 'crowd_id');
        return result;
    }

    /**
     * 获取单品单元下人群列表，只获取投放中的
     * @returns
     */
    private async getLastCharge(crowd_id_arr:number[]) {
        //实例化mongo连接
        let mongoClientInstance = mongoClient;
        await mongoClientInstance.getDB();
        //获取上次或过去某个时间点的数据
        let last_charge_arr = await mongoClientInstance.database.collection(this.mongoLogsCollections).aggregate([
            {//查询条件
                $match:{
                    crowd_id : {
                        $in : crowd_id_arr
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
                    _id : "$crowd_id",
                    crowd_id : {$first:"$crowd_id"},
                    last_charge : {$first:"$last_charge"},
                    date_minute : {$first:"$date_minute"},
                }
            }
        ]).toArray();

        // 根据人群id赋予键
        last_charge_arr = _.keyBy(last_charge_arr, 'crowd_id');
        return last_charge_arr;
    }

    /**
     * 数据处理并修改数据
     * @param fliterDataResult 获取到的计划下的人群数据
     * @returns 
     */
    private async adjuster (){
        const rptDataResult = await this.getRptData(); // 人群实时数据
        const crowdPageResult = await this.crowdPage(); // 人群出价
        const lastChargeResult = await this.getLastCharge(_.map(_.keys(crowdPageResult), _.parseInt)); // 人群存储在mongo中的最后一次出价
        const crowdAverageCost = _.round(_.divide(this.strategyData.total_budget, rptDataResult.length),2); // 计算人群平均花费 = 总预算/人群数量 //TODO 上传的total_budget单位待确认（暂定为分）

        // 修改人群出价接口需要的数据
        let crowdModifyRequest:{
            crowds: {
                price:number,
                status:string,
                crowd_id:number,
            }[];
            adgroup_id: number;
        } = {
            crowds : [],
            adgroup_id : this.strategyData.adgroup_id,
        };
        // 存储到mongo的数据
        let mongoData:any[] = [];

        // 循环人群实时数据
        rptDataResult.forEach( (filter:any)=>{
            if(!(filter.crowd_id in crowdPageResult)){
                //如果没有当前人群的出价，说明是非投放中，则不作处理
                return; //return 跳出当次循环
            }
            let  price = 0.05;  // 定义初始出价
            let  status = 'start'; // 定义初始状态
            let  price_range = 0.02; // 调价幅度，相当于百分之二
            let  last_charge = lastChargeResult.hasOwnProperty(filter.crowd_id) ? lastChargeResult[filter.crowd_id].last_charge : '0'; //上次花费 ，单位为元

            //消耗单位是元，上次消耗为元 当前出价为分，平均出价为分，最终出价为分
            if(filter.charge*100 > crowdAverageCost){
                //消耗大于日限均值,直接暂停
                status = 'pause'; //接口未体现暂停时pause，可能是其他的
                price = crowdPageResult[filter.crowd_id].price;//出价不变
            }else{
                let last_date_minute = lastChargeResult.hasOwnProperty(filter.crowd_id) ? lastChargeResult[filter.crowd_id].date_minute : "1970-01-01 00:00"; //上次修改时间
                let ten_before_minute = format(subMinutes(new Date(), this.theLastAdjusterDiffTime), 'yyyy-MM-dd HH:mm'); //过去十分钟的时间点
                if(last_date_minute > ten_before_minute){ //本次时间与上次修改时间不满十分钟
                    return;//未满10分钟 return 跳出当次循环
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
            }
            //将拼凑的数据压入最终数组
            crowdModifyRequest.crowds.unshift({
                price : price ,
                status : status,
                crowd_id : filter.crowd_id,
            });

            //将拼凑的数据压入最终数组
            mongoData.unshift({
                crowd_id : filter.crowd_id,
                last_charge : filter.charge, //当作上次花费
                adgroup_id : this.strategyData.adgroup_id,
                wangwangid : this.strategyData.wangwangid,
                date_minute : format(new Date(), 'yyyy-MM-dd HH:mm'), //上次操作时间 精确到分钟
                status : status, //保存好状态，以后查询可能用到
                last_price: price // 当作上次出价 （可能不需要，因为会查询淘宝api）
            });
        });
        if(crowdModifyRequest.crowds.length){
            //有数据、修改数据
            const adjusterData = new TaobaoFeedflowItemCrowdModifyBindClass(crowdModifyRequest, this.strategyData.wangwangid);
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

const test = new AverageCostStrategyClass(strategyData);
test.handle();
