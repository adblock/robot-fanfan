/**
 * AverageTimeStrategyClass 
 * 
 * 人群平均花费策略的实例类，按照时间平均花费
 * 超级推荐【商品推广】单元分时报表查询
 * 文档：https://open.taobao.com/API.htm?docId=43477&docType=2
 * */
import _, { clone } from 'lodash';
import { StrategyInterface } from '../strategy.interface';
import { TaobaoFeedflowItemCrowdModifyBindClass, TaobaoFeedflowItemCrowdRpthourlistClass, TaobaoFeedflowItemCrowdPageClass } from '../../api';
import {format, getHours, subDays, subHours, subMinutes } from 'date-fns';
import { exit } from 'process';
const excuteMinutes = 2

export class AverageTimeStrategyClass implements StrategyInterface {
    // 策略的常量数据
    public strategyData:any | {};
    private theLastAdjusterDiffTime = 1; // 与上一次调整的比较时间长度（分钟）
    private maxPrice:number = 120; // 最高出价（分）
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
            adgroup_id: this.strategyData.adgroup_id,    
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
    private async getLastData(fliterData:TaobaoFeedflowItemCrowdRpthourlistClass,pastExecutions:number = 1) {
        //获取过去某个时间点的数据
        const result = await fliterData.getResponseByDiffTime(this.theLastAdjusterDiffTime,pastExecutions);
       
        //循环处理每一条数据
        result.forEach((value:any,key:any) => {
            if(_.isEmpty(value) || value.created_am < format(subDays(new Date(), 1),'yyyy-MM-dd 23:59') || _.has(value.data,'error_response') || value.created_am < format(subMinutes(new Date(), 12),'yyyy-MM-dd HH:mm')){
                result[key] = [];
            }else{
                let endResult = value.data.feedflow_item_crowd_rpthourlist_response.result.rpt_list.rpt_result_dto;
                //数据处理
                let resultData =  this.makeCrowdData(endResult)
                result[key] = _.keyBy(resultData, 'crowd_id');;
            }
        });
        return result;
    }

    /**
     * 计算加价比例
     * @param nowPrice  //当前出价
     * @returns 
     */
    public makePriceAddRange(nowPrice:number) {
        let price_range;
        if(nowPrice < 10){//小于一毛，每次加一半的价格
            price_range = 0.3;
        }else if(nowPrice >= 10 && nowPrice <= 30){
            price_range = 0.1
        }else if(nowPrice > 30 && nowPrice <= 50){
            price_range = 0.05
        }else if(nowPrice > 50 && nowPrice <= 75){
            price_range = 0.03
        }else if(nowPrice > 75 && nowPrice < this.maxPrice){
            price_range = 0.014
        }else{
            price_range = 0 //大于150（1.5元），停止改价
        }
        return price_range;
    }

    /**
     * 计算降价比例
     * @param nowPrice  //当前出价
     * @returns 
     */
     public makePriceLessRange(nowPrice:number) {
        let price_range;
        if(nowPrice >= 10 && nowPrice <= 30){//大于1毛，每次降价10%
            price_range = 0.1;
        }else if(nowPrice > 40 && nowPrice <= 60){
            price_range = 0.05//小于一毛 每次降价17%
        }else if(nowPrice > 60 && nowPrice <= this.maxPrice){
            price_range = 0.06//小于一毛 每次降价17%
        }else{
            price_range = 0.17//小于一毛 每次降价17%
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
            campaign_id : this.strategyData.campaign_id,
            adgroup_id : this.strategyData.adgroup_id,
            log_date : format(new Date(), 'yyyy-MM-dd'),
            start_hour_id : 0,
            end_hour_id : getHours(new Date()),
            // end_hour_id : 12,
        };

        let pastExecutions = 5;//需要查询对比的过去执行次数
        const fliterData = new TaobaoFeedflowItemCrowdRpthourlistClass(requestData,this.strategyData.wangwangid); //实例化定向分时数据
        const lastResult = await this.getLastData(fliterData,pastExecutions); // 人群存储在mongo中的最后一次出价（或展现）

        const rptDataResult = await this.getRptData(fliterData); // 人群实时数据
        //如果出错 直接返回
        if(rptDataResult.error_response){
            return rptDataResult;
        }
        
        const crowdPageResult = await this.crowdPage(); // 人群出价
        let surplusBudget = this.strategyData.total_budget - _.round(_.sum(_.map(_.map(rptDataResult,'charge'),_.toNumber)) * 100,2); //剩余预算
        let surplusMinutes = _.round((new Date(format(new Date(),'yyyy-MM-dd 23:59:59')).getTime()- new Date().getTime())/60/1000);//剩余时间

        const crowdAverageCost = _.round((surplusBudget/_.size(crowdPageResult)/surplusMinutes*excuteMinutes),0); // 计算人群平均花费 = 剩余总预算/人群数量/剩余分钟数/每次执行时间 //TODO 上传的total_budget单位待确认（暂定为分）

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
        let beginStart = format(new Date(),'yyyy-MM-dd 23:55');//状态变更时间段开始
        let beginEnd = format(new Date(), 'yyyy-MM-dd 00:03');//状态变更时间段结束
        
        //循环处理人群，将暂停人群激活为投放中
        _.forEach(crowdPageResult, function(value, key) {
            let status = '';
            if(surplusBudget <= 0){
                //预算超额，所有人群暂停
                status = 'pause';
            }
            // 如果是新的一天，或者本日时间不足，状态为开始
            if(nowMinute>=beginStart || nowMinute <= beginEnd || surplusMinutes <= 0){
                status = 'start'
            }
            //存在需要处理的数据
            if(status){
                console.log(value.crowd_name + "状态更改为" + status)
                crowdModifyRequest.crowds.unshift({
                    price : 5,//调整价格为5分
                    status : status,
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

            let last_charge;//定义上次消耗
            if(_.isEmpty(lastResult)){ //如果没有之前的数据，则上次消耗记为0
                last_charge = 0
            }else{
                last_charge = lastResult[0].hasOwnProperty(filter.crowd_id) ? lastResult[0][filter.crowd_id].charge : 0; //上次花费
            }

            let crowdPagePrice = crowdPageResult[filter.crowd_id].price;//当前出价
            //上次执行到本次执行的消耗
            let stageCharge = _.round((filter.charge - last_charge) * 100,2);

            //阶段消耗本次平均花费,降低出价,消耗为元 需要*100
            if(stageCharge > crowdAverageCost){           
                let beyondRange = stageCharge / crowdAverageCost;//超出比例
                price_range = this.makePriceLessRange(crowdPagePrice);//计算降价价比例
                price = _.round(crowdPagePrice * (1 - price_range * beyondRange)  ,0);//按比例调整价格,因为单位是分，所以不保留小数
                console.log( crowdPageResult[filter.crowd_id].crowd_name + "本次消耗" + filter.charge*100 + "上次消耗" + last_charge * 100 + "这次花费" + stageCharge + "这次应花费" + crowdAverageCost + "  降价了")
                if(price <= 5){
                    price = 5;
                }
            }else{
                if(lastResult.length <=1){//没有上次数据，本次花费又低于平均花费
                    price_range = this.makePriceAddRange(crowdPagePrice);//计算加价比例
                    let tmpPrice = _.round(crowdPagePrice * (1 + price_range),0) 
                    price = (tmpPrice<=this.maxPrice) ? tmpPrice : this.maxPrice; //按比例调整价格
                    console.log(crowdPageResult[filter.crowd_id].crowd_name + "截止到本次消耗" + filter.charge*100 + "上次消耗" + last_charge * 100 + "截止到这次花费" + stageCharge + "这次应花费" + crowdAverageCost + "加价了" )
                }else{
                    let adPvPrice = false;
                    lastResult.forEach((value:any,key:any) => {
                        price = crowdPagePrice;//给出小于时的默认值，防止报错
                        if(key <= 0){ //如果是第一次 因为上面已经比较完  跳过
                            return; //跳出本次循环
                        }
                        let last_charge = value.hasOwnProperty(filter.crowd_id) ? value[filter.crowd_id].charge : 0; //上次花费
                       
                        let stageCharge = _.round((filter.charge - last_charge) * 100,2);//上次执行到本次执行的消耗
                        //如果大于平均花费
                        if(stageCharge >= crowdAverageCost){
                            console.log(crowdPageResult[filter.crowd_id].crowd_name + "截止到本次消耗" + filter.charge*100 + "截止到上次消耗" + last_charge * 100 + "这次花费" + stageCharge + "这次应花费" + crowdAverageCost + "价格不变了")
                            price = crowdPagePrice;//出价不变
                        }else{//TODO  此处可优化减少计算
                            //TODO 这里加一次关于展现的过滤
                            let last_ad_pv = value.hasOwnProperty(filter.crowd_id) ? value[filter.crowd_id].ad_pv : 0; //上次展现比率
                            let stageAdPv = last_ad_pv > 0 ? (filter.ad_pv - last_ad_pv)/last_ad_pv : 1;

                            //如果展现大于4（根据后台数据发现 没两分钟的最小展现大概是4）* 运行频率，则不加价，否则加价
                            if(stageAdPv >= 0.04 * key){
                                adPvPrice = true;
                                price = crowdPagePrice;//出价不变
                                console.log(crowdPageResult[filter.crowd_id].crowd_name + "截止到本次展现" + filter.ad_pv + "截止到上次展现" + last_ad_pv + "阶段展现" + stageAdPv + " 价格不变了")
                            }else{
                                if(adPvPrice){
                                    return;//如果循环当中有一次能够满足展现条件，则不再加价
                                }else{
                                    price_range = this.makePriceAddRange(crowdPagePrice);//计算加价比例
                                    let tmpPrice = _.round(crowdPagePrice * (1 + price_range),0) 
                                    price = (tmpPrice<=this.maxPrice) ? tmpPrice : this.maxPrice; //按比例调整价格
                                    console.log(crowdPageResult[filter.crowd_id].crowd_name + "截止到本次消耗" + filter.charge*100 + "截止到上次消耗" + last_charge * 100 + "这次花费" + stageCharge + "这次应花费" + crowdAverageCost + "阶段展现为" + _.round(stageAdPv,2) + "加价了")
                                }
                            }
                        }
                    });
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
                console.log(crowdPageResult[value].crowd_name + '涨价啦')
                price_range = this.makePriceAddRange(crowdPageResult[value].price)
                let price;
                let tmpPrice = _.round(crowdPageResult[value].price * (1 + price_range))
                price = (tmpPrice<=this.maxPrice) ? tmpPrice : this.maxPrice; //按比例调整价格
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
            console.log(format(new Date(),"yyyy-MM-dd HH:mm:ss") + "正在修改数据");
            // 有数据、修改数据
            const adjusterData = new TaobaoFeedflowItemCrowdModifyBindClass(crowdModifyRequest, this.strategyData.wangwangid);
            const adjusterResult = await adjusterData.getResponse();
            return adjusterResult;
            // return 1111;
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
    campaign_id:2173812989,
    adgroup_id:2651692616,
    wangwangid:'卡莫妮旗舰店',
    total_budget:20000 //单位是分
};

// token ： 6201f1214b9694e9088bdf0d4d2505a2fbd23a1efe1d634835086076
// 计划id ： 2136965458
// 单元id：2618700059
// 预算：100
// 旺旺：卡莫妮旗舰店

const test = new AverageTimeStrategyClass(strategyData);
// test.handle();

// 没两分钟执行一次的定时任务
let i = 0;
setInterval(function () {
    console.log(i,new Date(),'----------------------------------------------');
    i++;
    test.handle();
},1000*excuteMinutes*60)


