/**
 * AverageCostStrategyClass 
 * 
 * 人群平均花费策略的实例类，根据传入的数据，筛选数据，计算数据，构造为api类
 * 超级推荐【商品推广】单元分时报表查询
 * 文档：https://open.taobao.com/API.htm?docId=43477&docType=2
 * */
import _, { clone } from 'lodash';
import { StrategyInterface } from '../strategy.interface';
import { TaobaoFeedflowItemCrowdModifyBindClass, TaobaoFeedflowItemCrowdRpthourlistClass, TaobaoFeedflowItemCrowdPageClass } from '../../api';
import {format, getHours, subDays, subHours, subMinutes } from 'date-fns';

export class AverageCostStrategyClass implements StrategyInterface {
    // 策略的常量数据
    public strategyData:any | {};
    private theLastAdjusterDiffTime = 10; // 与上一次调整的比较时间长度（分钟）
    private maxPrice:number = 150; // 最高出价（分）
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
    private async getRptData(fliterData:TaobaoFeedflowItemCrowdRpthourlistClass){
        //获取数据
        const result = await fliterData.getResponse();
        //如果返回数据包含错误信息 直接返回
        if(result.error_response){
           return result;
        }else{
            //获取有用数据
            let endResult = result.feedflow_item_crowd_rpthourlist_response.result.rpt_list.rpt_result_dto;
            //数据最终承载数组
            let resultData =  this.makeCrowdData(endResult)

            return  resultData;
        }
    }

    /**
     * 处理人群对应的数据
     * @param endResult 最终待处理数组
     * @param resultData 最终数据结果 
     * @returns 
     */
    public makeCrowdData(endResult:any) {
         //将数据按照人群id分组
         endResult = _.groupBy(endResult, "crowd_id");
         //数据最终承载数组
         let resultData:{}[] = [];
         //数据最终承载数组
        _.forEach(endResult, function(value, key) {
            let tmpSum = _.round(_.sum(_.map(_.map(value,'charge'),_.toNumber)),2);//花费
            let tmpPv = _.sum(_.map(_.map(value,'ad_pv'),_.toNumber));//展现
            resultData.unshift({
                crowd_id : _.toNumber(key),
                charge : _.toString(tmpSum),//将数据还原为原始数据字符串类型
                ad_pv : tmpPv,
            })
        });
        return resultData;
    }

    /**
     * 获取单品单元下人群列表，只获取投放中的
     * @returns 
     */
    private async crowdPage() {
        //拼接查询参数
        let requestData = {
            crowd_query : 
            {
                adgroup_id: this.strategyData.adgroup_id,
                // status_list : ['start'] //只获取投放中的的
            }         
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
    private async getLastData(fliterData:TaobaoFeedflowItemCrowdRpthourlistClass) {
        //获取过去某个时间点的数据
        const result = await fliterData.getResponseByDiffTime(this.theLastAdjusterDiffTime);
        if(_.isEmpty(result) || result[0].data.error_response){
            return result;//数据为空着实错误直接返回空数组
        }else{
            //获取有用数据
            let endResult = result[0].data.feedflow_item_crowd_rpthourlist_response.result.rpt_list.rpt_result_dto;
            //数据处理
            let resultData =  this.makeCrowdData(endResult)
            return  _.keyBy(resultData, 'crowd_id');;
        }
    }

    /**
     * 计算加价比例
     * @param nowPrice  //当前出价
     * @returns 
     */
    public makePriceRange(nowPrice:number) {
        let price_range;
        if(nowPrice < 10){//小于一毛，每次加一半的价格
            price_range = 0.3;
        }else if(nowPrice >= 10 && nowPrice <= 50){
            price_range = 0.1
        }else if(nowPrice > 50 && nowPrice <= 80){
            price_range = 0.05
        }else if(nowPrice > 80 && nowPrice <= 100){
            price_range = 0.03
        }else if(nowPrice > 100 && nowPrice < this.maxPrice){
            price_range = 0.01
        }else{
            price_range = 0 //大于150（1.5元），停止改价
        }
        return price_range;
    }

    /**
     * 数据处理并修改数据
     * @param fliterDataResult 获取到的计划下的人群数据
     * @returns 
     */
    private async adjuster (){
        //拼凑实时数据接口查询参数
        let requestData = {
            rpt_query:{
                campaign_id : this.strategyData.campaign_id,
                adgroup_id : this.strategyData.adgroup_id,
                log_date : format(new Date(), 'yyyy-MM-dd'),
                start_hour_id : 0,
                end_hour_id : getHours(new Date()),
            }
        };
        const fliterData = new TaobaoFeedflowItemCrowdRpthourlistClass(requestData,this.strategyData.wangwangid); 
        const lastResult = await this.getLastData(fliterData); // 人群存储在mongo中的最后一次出价（或展现）

        const rptDataResult = await this.getRptData(fliterData); // 人群实时数据
        //如果出错 直接返回
        if(rptDataResult.error_response){
            return rptDataResult;
        }

        const crowdPageResult = await this.crowdPage(); // 人群出价
        const crowdAverageCost = _.round(_.divide(this.strategyData.total_budget, _.size(crowdPageResult)),0); // 计算人群平均花费 = 总预算/人群数量 //TODO 上传的total_budget单位待确认（暂定为分）

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

        let nowMinute = format(new Date(), 'yyyy-MM-dd HH:mm');//当前时间
        let beginStart = format(subDays(new Date(), 1),'yyyy-MM-dd 23:55');//状态变更时间段开始
        let beginEnd = format(new Date(), 'yyyy-MM-dd 00:03');//状态变更时间段结束
        
        //循环处理人群，将暂停人群激活为投放中
        _.forEach(crowdPageResult, function(value, key) {
            // 如果是新的一天，将价格调为最低价
            if(nowMinute>=beginStart && nowMinute <= beginEnd){
                crowdModifyRequest.crowds.unshift({
                    price : 5,
                    status : 'start',
                    crowd_id : value.crowd_id,
                });
                delete crowdPageResult[key]; //去掉已操作数据
            }
        });

        let  price_range = 1; // TODO  暂时定为1分调价幅度，相当于百分之5
        // 循环人群实时数据
        rptDataResult.forEach( (filter:any)=>{
            if(!(filter.crowd_id in crowdPageResult)){
                //如果没有当前人群的出价或者暂停，说明是非投放中，则不作处理
                return; //return 跳出当次循环
            }else{
                //在里面 但是是暂停状态，说明已超额，不做处理
                if(crowdPageResult[filter.crowd_id].status === 'pause'){
                    delete crowdPageResult[filter.crowd_id]; //删除暂停超额的数据
                    return; //return 跳出当次循环
                }
            }
            let  price = 5;  // 定义初始出价
            let  status = 'start'; // 定义初始状态
            let  last_ad_pv = lastResult.hasOwnProperty(filter.crowd_id) ? lastResult[filter.crowd_id].ad_pv : 0; //上次展现
            let crowdPagePrice = crowdPageResult[filter.crowd_id].price;//当前出价
            //消耗单位是元，上次消耗为元 当前出价为分，平均出价为分，最终出价为分
            if(filter.charge*100 > crowdAverageCost){
                //消耗大于日限均值,直接暂停
                status = 'pause'; //接口未体现暂停时pause，可能是其他的
                price = crowdPagePrice;//出价不变
            }else{
                //消耗小于人群平均日限比较展现
                if(filter.ad_pv > last_ad_pv ){
                    //当前时刻较上次（也可能是过去的某个时间点）展现上升,出价不变
                    price = crowdPagePrice;//出价不变
                }else{
                    //当前时刻较上次（也可能是过去的某个时间点）展现未变,出价上调
                    price_range = this.makePriceRange(crowdPagePrice);//计算加价比例
                    if(crowdPagePrice > this.maxPrice){
                        price = this.maxPrice;//将价格设置为最高出价
                    }else{
                        let tmpPrice = _.round(crowdPagePrice * (1 + price_range))
                        price = (tmpPrice<=this.maxPrice) ? tmpPrice : this.maxPrice; //按比例调整价格
                    }
                }
            }
            //将拼凑的数据压入最终数组
            crowdModifyRequest.crowds.unshift({
                price : price ,
                status : status,
                crowd_id : filter.crowd_id,
            });
            delete crowdPageResult[filter.crowd_id];//去掉已操作数据
        });

        //处理出价接口未曾处理的数据（说明还没有展现）
        Object.keys(crowdPageResult).forEach((value:any) => {
            if(crowdPageResult[value].price <= this.maxPrice){
                price_range = this.makePriceRange(crowdPageResult[value].price)
                let price;
                let tmpPrice = _.round(crowdPageResult[value].price * (1 + price_range))
                price = (tmpPrice<=150) ? tmpPrice : 150; //按比例调整价格
                //写入数据
                crowdModifyRequest.crowds.unshift({
                    price : price,
                    status : 'start',
                    crowd_id : crowdPageResult[value].crowd_id,
                });
            }
            delete crowdPageResult[value];//去掉已操作数据
        });

        if(crowdModifyRequest.crowds.length){
            // 有数据、修改数据
            const adjusterData = new TaobaoFeedflowItemCrowdModifyBindClass(crowdModifyRequest, this.strategyData.wangwangid);
            const adjusterResult = await adjusterData.getResponse();
            return adjusterResult;
        }else{
            return '没有要修改的数据'
        }
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
    campaign_id:2136965458,
    adgroup_id:2618700059,
    wangwangid:'卡莫妮旗舰店',
    total_budget:20000 //单位是分
};

// token ： 6201f1214b9694e9088bdf0d4d2505a2fbd23a1efe1d634835086076
// 计划id ： 2136965458
// 单元id：2618700059
// 预算：100
// 旺旺：卡莫妮旗舰店

const test = new AverageCostStrategyClass(strategyData);
// test.handle();

//没两分钟执行一次的定时任务
let i = 0;
setInterval(function () {
    console.log(i,new Date(),'----------------------------------------------');
    i++;
    test.handle();
},1000*2*60)


