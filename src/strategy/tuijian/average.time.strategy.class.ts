/**
 * AverageTimeStrategyClass 
 * 
 * 人群平均花费策略的实例类，按照时间平均花费
 * 超级推荐【商品推广】单元分时报表查询
 * 文档：https://open.taobao.com/API.htm?docId=43477&docType=2
 * */
import _, { clone, values } from 'lodash';
import { StrategyInterface } from '../strategy.interface';
import { TaobaoFeedflowItemCrowdModifyBindClass, TaobaoFeedflowItemCrowdRpthourlistClass, TaobaoFeedflowItemCrowdPageClass } from '../../api';
import {addMinutes, format, getHours, secondsInHour, subDays, subHours, subMinutes } from 'date-fns';
import { exit } from 'process';
import { TaobaoFeedflowItemCampaignGetClass } from '../../api/tuijian/taobao.feedflow.item.campaign.get.class';
import { TaobaoFeedflowItemCampaignRpthourlistClass } from '../../api/tuijian/taobao.feedflow.item.campaign.rpthourlist.class';
import { MysqlClient } from '../../libs/mysqlClient';
import { log } from 'console';
import { compileFunction } from 'vm';
import { TaobaoFeedflowItemAdgroupPageClass } from '../../api/tuijian/taobao.feedflow.item.adgroup.page.class';
import { TaobaoFeedflowItemCampaignModifyClass } from '../../api/tuijian/taobao.feedflow.item.campaign.modify.class';
import { TaobaoFeedflowItemAdgroupRpthourlistClass } from '../../api/tuijian/taobao.feedflow.item.adgroup.rpthourlist.class';
const excuteMinutes = 2;//执行频率（单位：分钟）

export class AverageTimeStrategyClass implements StrategyInterface {
    // 策略的常量数据
    public strategyData:any | {};
    private theLastAdjusterDiffTime = 1; // 与上一次调整的比较时间长度（分钟）
    private maxPrice:number = 5; // 最高出价（分）
    private minPrice:number = 5; // 最低出价（分）
    private pastExecutions:number = 5;//需要查询对比的过去执行次数

    /**
     * 构造查询参数
     * @param strategyData 用户传入数据
     */
     constructor(){
        this.strategyData = {
            campaign_id: 0,
            adgroup_id: 0,
            wangwangid: '',
        };
    }

    /**
     * 定义修改接口的数据参数格式
     */
    private async crowdModifyRequest(){
        let crowdModifyRequest :{
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
        return crowdModifyRequest;
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
            let tmpSum = _.round(_.sum(_.map(_.map(value,'charge'),_.toNumber)),2) * 100;//花费转为分
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
    private async getLastData(fliterData:TaobaoFeedflowItemCrowdRpthourlistClass,beginStart:any) {
        //获取过去某个时间点的数据
        const result = await fliterData.getResponseByDiffTime(this.theLastAdjusterDiffTime,this.pastExecutions);
        //循环处理每一条数据,//TODO 此处需要修改
        result.forEach((value:any,key:any) => {
            //如果数据为空||创建时间不是今天||报错||创建时间大于12分钟||创建时间大🐠阶段开始，则返回空数组
            if(_.isEmpty(value) || value.created_am < format(subDays(new Date(), 1),'yyyy-MM-dd 23:59') || _.has(value.data,'error_response') || value.created_am < format(subMinutes(new Date(), 12),'yyyy-MM-dd HH:mm') || value.created_am < beginStart){
                delete result[key];//TODO 此处不知道为啥不生效
            }else{
                let endResult = value.data.feedflow_item_crowd_rpthourlist_response.result.rpt_list.rpt_result_dto;
                //数据处理//计算的仍然是凌晨到某个时刻的数据
                let resultData = this.makeCrowdData(endResult)
                result[key] = _.keyBy(resultData, 'crowd_id');
            }
        });
        return _.compact(result);
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
        if(nowPrice >= 10 && nowPrice <= 30){ //大于1毛，每次降价10%
            price_range = 0.1;
        }else if(nowPrice > 40 && nowPrice <= 60){
            price_range = 0.05; //5%
        }else if(nowPrice > 60 && nowPrice <= this.maxPrice){
            price_range = 0.06; //6%
        }else{
            price_range = 0.17; //17%
        }
        return price_range;
    }


    /**
     * 实例化实时数据类
     * @returns 
     */
    private async instanceTaobaoFeedflowItemCrowdRpthourlistClass(){
        let requestData = {
            campaign_id : this.strategyData.campaign_id,
            adgroup_id : this.strategyData.adgroup_id,
            log_date : format(new Date(), 'yyyy-MM-dd'),
            start_hour_id : 0,
            end_hour_id : getHours(new Date()),
            // end_hour_id : 12,
        };

        const fliterData = new TaobaoFeedflowItemCrowdRpthourlistClass(requestData,this.strategyData.wangwangid); //实例化
        return fliterData;
    }


    /**
     * 获取计划投放时段数据,型数据库获取
     * @returns 
     */
    public async getCampaignTimesData() {
        let MysqlClientInstance = MysqlClient.mysql;
        let where:any = {
            'f_type': 'chaotui',//类型
        };
        let campaignTimesData = await MysqlClientInstance.table('t_automatic_operation_spider').where(where).select();
        //按照旺旺分组
        campaignTimesData = _.groupBy(campaignTimesData,'f_wangwang');
        //循环旺旺并把旺旺下的计划分组
        _.forEach(campaignTimesData,function (value:any,key:any) {
            campaignTimesData[key] = _.groupBy(value,'f_campaign_id');
        });
        return campaignTimesData;
    }


    /**
     * 处理数据 计算人群出价
     * @param lastResult 历史数据
     * @param crowdModifyRequest 数据修改接口所需数据
     * @param stageInfo 阶段信息
     * @param beginStartStatus 阶段初始状态
     * @returns 
     */
    private async makeCrowdPrice(rptDataResult:any,lastResult:any,stageInfo:any,beginStartStatus:any){
        //单元下的人群出价
        let crowdPageResult = await this.crowdPage(); 
        //获取修改人群出价接口需要的数据格式
        let crowdModifyRequest = await this.crowdModifyRequest();
        //计算剩余时间（分钟）=阶段投放截止时间-当前时间/60秒/1000毫秒 //TODO 此处有个问题，如果开始结束跨天则很难搞
        let surplusMinutes = _.round((new Date(stageInfo.beginEnd).getTime()-new Date().getTime())/60/1000);
        //计算单元当前的总消耗（转换单位为分）
        let adGroupCost = _.sum(_.map(_.map(rptDataResult,'charge'),_.toNumber));
        //简化单元初始消耗
        let adGroupFirstCharge = stageInfo.f_crowd_start_charge[this.strategyData.adgroup_id] * 100;
        //剩余单元阶段总预算=单元阶段预算-（当前单元消耗-单元阶段初始消耗）
        let surplusBudget = stageInfo.timeBudget - (adGroupCost - adGroupFirstCharge);
        //计算人群平均花费 = 剩余总预算/人群数量/剩余分钟数/每次执行时间 //TODO 上传的time_budget单位待确认（暂定为分）
        const crowdAverageCost = _.round((surplusBudget/_.size(crowdPageResult)/surplusMinutes*excuteMinutes),0); 
        //更改人群状态,只有超额和首次开始会修改状态
        let changeCrowdPageResult = await this.changeCrowdPageStatus(crowdPageResult,surplusBudget,beginStartStatus,crowdModifyRequest);
        crowdModifyRequest = changeCrowdPageResult.crowdModifyRequest;//重新为数据修改接口所需数据赋值
        crowdPageResult = changeCrowdPageResult.crowdPageResult;//重新为人群出价和状态赋值
        //根据实时数据计算出价
        crowdModifyRequest = await this.makeRptDataInfo(rptDataResult,crowdPageResult,lastResult,crowdAverageCost,crowdModifyRequest)
        //返回需要修改的数据
        return crowdModifyRequest;
    }

    /**
     * 修改数据库的阶段自动计划信息
     * @param stageInfo 阶段信息自动计划数据
     * @param campaignCost 此刻的计划总花费（单位是分）
     * @returns 
     */
    public async updateAutoMaticData(stageInfo:any) {
         //获取mysql实例
         let MysqlClientInstance = MysqlClient.mysql;
         //设置修改条件
         let where:any = {
             'id': stageInfo.id, //数据对应的id
         };
         //添加修改字段
         let update = {
             'f_start_charge' : _.round(stageInfo.f_start_charge/100,2),//转化为元
             'f_crawl_date' : format(new Date(),'yyyy-MM-dd'),//将最后执行日期改为今天
             'f_crowd_start_charge' : JSON.stringify(stageInfo.f_crowd_start_charge),//添加阶段开始时各个单元对应的花费，需要注意的是这里添加的是计划下面所有单元的数据,转换为json字符串，单位是元
         };
         //修改相关数据 //TODO 此处返回值类型有待确认
        await MysqlClientInstance.table('t_automatic_operation_spider').where(where).update(update);
    }

    /**
     * 修改人群状态
     * @param crowdPageResult 人群实时出价数据和状态
     * @param surplusBudget 阶段剩余预算
     * @param beginStartStatus 开始状态
     * @param crowdModifyRequest 数据修改接口所需数据
     * @returns 
     */
    public async changeCrowdPageStatus(crowdPageResult:any,surplusBudget:any,beginStartStatus:any,crowdModifyRequest:any){
        Object.keys(crowdPageResult).forEach((value:any) => {
            let status = '';
            // 如果是阶段开始的话，所有人群开启
            if(beginStartStatus){
                status = 'start'
            }
            //阶段预算超额，所有人群暂停
            if(surplusBudget <= 0){
                status = 'pause';
            }
           
            //存在需要处理的数据
            if(status){
                console.log(crowdPageResult[value].crowd_name + "状态更改为" + status)
                //拼接需要修改的数据
                crowdModifyRequest = this.makeCrowdModifyRequest(crowdModifyRequest,this.minPrice,status,crowdPageResult[value].crowd_id);
                delete crowdPageResult[value]; //去掉已操作数据
            }
        });
        return {
            crowdPageResult:crowdPageResult,
            crowdModifyRequest:crowdModifyRequest
        }
    }

    /**
     * 根据实时数据计算出价
     * @param rptDataResult 实时数据
     * @param crowdPageResult 实时出价
     * @param lastResult 历史数据
     * @param crowdAverageCost 平均出价
     * @param crowdModifyRequest 价格修改接口所需参数
     * @returns 
     */
    public async makeRptDataInfo(rptDataResult:any,crowdPageResult:any,lastResult:any,crowdAverageCost:any,crowdModifyRequest:any) {
        rptDataResult.forEach( (filter:any)=>{
            if(!(filter.crowd_id in crowdPageResult)){
                //如果没有当前人群的出价或者暂停，说明是非投放中，则不作处理//return 跳出当次循环
                return;
            }else{
                //在里面 但是是暂停状态，说明已超额，不做处理
                if(crowdPageResult[filter.crowd_id].status === 'pause'){
                    console.log(crowdPageResult[filter.crowd_id].crowd_name + "状态为暂停，不做处理，跳过")
                    delete crowdPageResult[filter.crowd_id]; //删除暂停超额的数据//return 跳出当次循环
                    return; 
                }
            }
            let  price = this.minPrice;  // 定义初始出价
            let  status = 'start'; // 定义初始状态
            let last_charge = this.makeLastCharge(lastResult,filter);//上次花费
            last_charge = last_charge === 0 ? filter.charge : last_charge;
            let crowdPagePrice = crowdPageResult[filter.crowd_id].price;//当前出价
            let stageCharge = filter.charge - last_charge;  //上次执行到本次执行的消耗(单位：分)
            //计算本次出价
            price = this.makePrice(stageCharge,crowdAverageCost,crowdPagePrice,filter,lastResult,crowdPageResult);
            //拼凑需要修改的数据
            crowdModifyRequest = this.makeCrowdModifyRequest(crowdModifyRequest,price,status,filter.crowd_id);
            //去掉已操作数据
            delete crowdPageResult[filter.crowd_id];
        });

        //计算剩余数据
        crowdModifyRequest = this.makeOverageData(crowdPageResult,crowdModifyRequest);
        //返回需要修改的数据
        return crowdModifyRequest;
    }

    /**
     * 计算上次花费
     * @param lastResult 上次人群数据
     * @param filter 当前人群数据
     * @returns last_charge 上次人群花费
     */
    public makeLastCharge(lastResult:any,filter:any) {
        let last_charge;//定义上次消耗
        if(_.isEmpty(lastResult)){ //如果没有之前的数据，则上次消耗记为0
            last_charge = 0
        }else{
            last_charge = lastResult[0].hasOwnProperty(filter.crowd_id) ? lastResult[0][filter.crowd_id].charge : 0; //上次花费
        }
        return last_charge;
    }

    /**
     * 计算本次出价
     * @param stageCharge 上次到这次的花费
     * @param crowdAverageCost 平均花费
     * @param crowdPagePrice 当前出价
     * @param filter 当前数据
     * @param lastResult 过去数据
     * @param crowdPageResult 实时出价结果
     * @return price 出价
     */
    public makePrice(stageCharge:any,crowdAverageCost:any,crowdPagePrice:any,filter:any,lastResult:any,crowdPageResult:any){
        let price;//出价
        let price_range;//调价比例
        if(stageCharge > crowdAverageCost){    
            console.log(crowdPageResult[filter.crowd_id].crowd_name + "上次到这次的花费" + stageCharge + "，平均花费为"+ crowdAverageCost + "，降价了") 
            let beyondRange = stageCharge / crowdAverageCost;//超出比例
            price_range = this.makePriceLessRange(crowdPagePrice);//计算降价价比例
            price = _.round(crowdPagePrice * (1 - price_range * beyondRange)  ,0);//按比例调整价格,因为单位是分，所以不保留小数
        }else{
            if(lastResult.length <=1){//没有上次数据，本次花费又低于平均花费
                price_range = this.makePriceAddRange(crowdPagePrice);//计算加价比例
                price = _.round(crowdPagePrice * (1 + price_range),0) 
                console.log(crowdPageResult[filter.crowd_id].crowd_name + "上次到这次的花费" + stageCharge + "，平均花费为"+ crowdAverageCost + "，加价了") 
            }else{
                //有历史数据 计算历史数据
                price = this.makeLastPrice(lastResult,crowdPagePrice,filter,crowdAverageCost);
                if(price > crowdPagePrice){
                    console.log(crowdPageResult[filter.crowd_id].crowd_name + "上次到这次的花费" + stageCharge + "，平均花费为"+ crowdAverageCost + ",存在上次数据，涨价了")
                }else{
                    console.log(crowdPageResult[filter.crowd_id].crowd_name + "上次到这次的花费" + stageCharge + "，平均花费为"+ crowdAverageCost + ",存在上次数据，价格不变")
                }
            }
        }
        if(price <= this.minPrice){
            price = this.minPrice; //小于最小值，等于最小值
        }
        if(price >= this.maxPrice){
            price = this.maxPrice; //超过最大值，等于最大值
        } 
        return price;
    }

    /**
     * 计算是否根据过去的数据改价
     * @param lastResult 上次数据结果
     * @param crowdPagePrice 当前出价
     * @param filter 当前数据结果
     * @param crowdAverageCost 平均出价
     * @returns 
     */
    private makeLastPrice(lastResult:any,crowdPagePrice:any,filter:any,crowdAverageCost:any):number{
        let price:any = crowdPagePrice;//出价变量,给予当前出价作为默认值
        let price_range;//加价比例
        let adPvPrice = false;//是否根据展现改价
        lastResult.forEach((value:any,key:any) => {
            if(key <= 0){ //如果是第一次 因为上面已经比较完  跳过
                return; //跳出本次循环
            }
            let last_charge = value.hasOwnProperty(filter.crowd_id) ? value[filter.crowd_id].charge : 0; //上次花费
           
            let stageCharge = filter.charge - last_charge;//上次执行到本次执行的消耗
            //如果小于平均花费则处理，如果大于则保持当前价格
            if(stageCharge < crowdAverageCost){//TODO  此处可优化减少计算
                //TODO 这里加一次关于展现的过滤
                let last_ad_pv = value.hasOwnProperty(filter.crowd_id) ? value[filter.crowd_id].ad_pv : 0; //上次展现数
                let stageAdPv = last_ad_pv > 0 ? (filter.ad_pv - last_ad_pv)/last_ad_pv : 1;//阶段展现比率
                //如果展现比率大于百分之4（根据后台数据发现 每两分钟的最小展现比率大概是4百分之）* 运行频率，则不加价，否则加价
                if(stageAdPv >= 0.04 * key){
                    adPvPrice = true;
                    price = crowdPagePrice;//出价不变
                }else{
                    if(adPvPrice){
                        return;//如果循环当中有一次能够满足展现条件，则不再加价
                    }else{
                        price_range = this.makePriceAddRange(crowdPagePrice);//计算加价比例
                        price = _.round(crowdPagePrice * (1 + price_range),0) 
                    }
                }
            }
        });
        return price;
    }

    /**
     * 计算剩余数据
     * @param crowdPageResult 实时出价
     * @param crowdModifyRequest 价格修改接口所需参数
     * @returns 
     */
    public makeOverageData(crowdPageResult:any,crowdModifyRequest:any){
        let price_range;//价格修改比例
         //处理出价接口未曾处理的数据（说明还没有展现）
         Object.keys(crowdPageResult).forEach((value:any) => {
            if(crowdPageResult[value].price <= this.maxPrice){
                price_range = this.makePriceAddRange(crowdPageResult[value].price)
                let price;
                let tmpPrice = _.round(crowdPageResult[value].price * (1 + price_range))
                price = (tmpPrice<=this.maxPrice) ? tmpPrice : this.maxPrice; //按比例调整价格
                console.log(crowdPageResult[value].crowd_name + "人群没有数据,所以需要加价") 
                //拼接需要修改的数据
                crowdModifyRequest = this.makeCrowdModifyRequest(crowdModifyRequest,price,'start',crowdPageResult[value].crowd_id);
            }
            delete crowdPageResult[value];//去掉已操作数据
        });
        return crowdModifyRequest;
    }

    /**
     * 拼凑需要修改的数据
     * @param crowdModifyRequest 需要修改的数据
     * @param price 价格
     * @param status 状态
     * @param crowd_id 人群对应的id
     * @returns 返回需要修改的数据
     */
    public makeCrowdModifyRequest(crowdModifyRequest:any,price:any,status:any,crowd_id:any){
        crowdModifyRequest.crowds.unshift({
            price : price,
            status : status,
            crowd_id : crowd_id,
        });
        return crowdModifyRequest;
    }


    /**
     * 获取计划对应的每天的预算
     * @returns 
     */
    public async getCampaignInfo(){
        let requestData = {//拼凑参数
            campagin_id : this.strategyData.campaign_id
        };
        let campaignItemClass =  new TaobaoFeedflowItemCampaignGetClass(requestData,this.strategyData.wangwangid);
        let dayBudget = await campaignItemClass.getResponse();
        dayBudget = dayBudget.feedflow_item_campaign_get_response.result.result.day_budget;
        return dayBudget;
    }

    /**
     * 获取计划此刻的消耗
     * @returns 
     */
    public async getCampaignCostInfo(){
        let requestData = {
            campaign_id : this.strategyData.campaign_id,
            log_date : format(new Date(), 'yyyy-MM-dd'),
            start_hour_id : 0,
            end_hour_id : getHours(new Date()),
        };

        let fliterData = new TaobaoFeedflowItemCampaignRpthourlistClass(requestData,this.strategyData.wangwangid); //实例化

        //数据获取和处理
        let campaignCost = await fliterData.getResponse();
        campaignCost = campaignCost.feedflow_item_campaign_rpthourlist_response.result.rpt_list.rpt_result_dto;
        //计算花费并转化为已分为单位
        campaignCost = _.round(_.sum(_.map(_.map(campaignCost,'charge'),_.toNumber)),2) * 100; 
        return campaignCost;
    }

    /**
     * 将计划暂停
     * @param status 计划状态
     * @returns 
     */
    public async changeCampaignStatus(status:string){
        let requestData = {//拼凑参数
            campaign_id : this.strategyData.campaign_id,
            status : status
        };
        let campaignItemClass =  new TaobaoFeedflowItemCampaignModifyClass(requestData,this.strategyData.wangwangid);
        await campaignItemClass.getResponse();
    }


    /**
     * 从数据库获取阶段投放数据并确定投放时段
     * @param campaignTimesData //计划信息
     * @param campaignId 计划id
     * @returns 阶段投放信息数据
     */
    public async makeTimesData(campaignTimesData:any){
        let nowTimeTmp = format(new Date(), 'HH:mm:ss');//当前时间
        let stageInfo:any = null;//阶段投放信息承载变量
        Object.keys(campaignTimesData).forEach((value:any) => {
            //当前时间不在时间段内跳过，在时间段内赋值
            if(nowTimeTmp >= campaignTimesData[value].f_start && nowTimeTmp <= campaignTimesData[value].f_end){
                //添加带日期的阶段开始和结束时间
                campaignTimesData[value].beginStart = format(new Date(),'yyyy-MM-dd ' + campaignTimesData[value].f_start);
                campaignTimesData[value].beginEnd = format(new Date(),'yyyy-MM-dd ' + campaignTimesData[value].f_end);
                campaignTimesData[value].timeBudget = campaignTimesData[value].f_budget * 100;//预算转换为分
                campaignTimesData[value].f_start_charge = campaignTimesData[value].f_start_charge * 100;//最初消耗转换为分
                campaignTimesData[value].f_max_price = campaignTimesData[value].f_max_price * 100;//最高出价转换为分
                if(campaignTimesData[value].f_crowd_start_charge){
                    campaignTimesData[value].f_crowd_start_charge = JSON.parse(campaignTimesData[value].f_crowd_start_charge);//将json字符串转换为json对象
                }
                stageInfo = campaignTimesData[value];//将数据赋值给阶段投放信息承载变量
                this.maxPrice = campaignTimesData[value].f_max_price;
            }
        });
        return stageInfo;
    }

    /**
     * 将需要修改的人群数据传给接口
     * @param crowdModifyRequest 需要修改的数据
     * @returns 
     */
    public async updateCrowdInfo(crowdModifyRequest:any){
        if(crowdModifyRequest.crowds.length){
            console.log(format(new Date(),"yyyy-MM-dd HH:mm:ss") + "正在修改数据");
            // 有数据、修改数据
            const adjusterData = new TaobaoFeedflowItemCrowdModifyBindClass(crowdModifyRequest, this.strategyData.wangwangid);
            const adjusterResult = await adjusterData.getResponse();
            return adjusterResult;
        }else{
            return "没有需要修改的数据 ";
        }
    }

    /**
     * 获取计划对应的单元数组
     * @param campaignIdArr 
     * @returns 
     */
    public async getAdGroupIds(campaignIdArr:any){
        //拼凑参数
        let AdgroupInstanceParams = {
            campaign_id_list:campaignIdArr
        };
        //获取数据
        let AdgroupInstance = new TaobaoFeedflowItemAdgroupPageClass(AdgroupInstanceParams,this.strategyData.wangwangid);
        let adgroupPage =  await AdgroupInstance.getResponse();
        if(adgroupPage.hasOwnProperty('error_response')){//如果报错 返回false
            adgroupPage = false;
        }else{
            adgroupPage = adgroupPage.feedflow_item_adgroup_page_response.result;//将数据格式化
            if(adgroupPage.hasOwnProperty('results') ){//判断是否有内容
                adgroupPage = adgroupPage.results.adgroup_d_to;
                //按照计划分组
                adgroupPage = _.groupBy(adgroupPage,'campaign_id');
            }else{
                adgroupPage = false;
            }
        }
        return adgroupPage;
    }


    /**
     * 获取并计算计划下的单元平均花费
     * @returns 
     */
    public async getAdGroupCostData(){
        let requestData = {//拼凑查询参数
            campaign_id : this.strategyData.campaign_id,
            log_date : format(new Date(), 'yyyy-MM-dd'),
            start_hour_id : 0,
            end_hour_id : getHours(new Date()),
        };

        //实例化
        let adGroupCostInstance = new TaobaoFeedflowItemAdgroupRpthourlistClass(requestData,this.strategyData.wangwangid);
        //获取数据
        let adGroupCostData = await adGroupCostInstance.getResponse();
        //去掉多余内容
        adGroupCostData = adGroupCostData.feedflow_item_adgroup_rpthourlist_response.result.rpt_list.rpt_result_dto;
        //按照单元分组
        adGroupCostData = _.groupBy(adGroupCostData, "adgroup_id");
        //数据最终承载数组
        let resultData:{} = {};
        //循环处理每个单元的数据
        _.forEach(adGroupCostData, function(value, key) {
            //计算花费
            let tmpSum = _.round(_.sum(_.map(_.map(value,'charge'),_.toNumber)),2);
            //合并对象
            resultData = _.assign(resultData, {[key] : tmpSum });
            // resultData = _.concat(resultData, [{key : tmpSum}]);
        });
        return resultData;
    }

    /**
     * 数据处理并修改数据
     * @param fliterDataResult 获取到的计划下的人群数据
     * @returns 
     */
    private async adjuster (){
        let campaignTimesDataInfo = await this.getCampaignTimesData();//从数据库获取按照旺旺和计划分组的数据;
        //循环处理每一个店铺的数据
        for (let wangwangid in campaignTimesDataInfo) {
            this.strategyData.wangwangid = wangwangid; //为通用字段旺旺赋值
            let campaignTimesData = campaignTimesDataInfo[wangwangid];//设置计划分组的数据变量
            let campaignIdArr = _.keys(campaignTimesData);//所有的计划id
            let adgroupInfos = await this.getAdGroupIds(campaignIdArr);//根据计划id获取计划下所有的单元，并按照计划分组
            if(!adgroupInfos) continue;//如果没有数据直接跳过
            //循环处理每个计划
            for(let campaignId in campaignTimesData){
                if(campaignId === '1624756400') continue;
                this.strategyData.campaign_id = campaignId; //为通用字段计划id赋值
                let stageInfo = await this.makeTimesData(campaignTimesData[campaignId]);//根据时间筛选当前计划下的数据
                if(!stageInfo){
                    console.log("计划" + campaignId + "未在投放时间段内，计划暂停");
                    await this.changeCampaignStatus('pause'); //如果没有符合条件的数据，将计划暂停
                    return "未在投放时间段内，计划暂停";//循环终止
                }else{
                    let campaignBudget = await this.getCampaignInfo();// 获取计划对应的总预算，单位是分
                    let campaignCost = await this.getCampaignCostInfo(); //获取计划已消耗金额，单位是分
                    let surplusCampaignBudget = campaignBudget - campaignCost;//计算计划剩余总预算
                    if(surplusCampaignBudget <= 0){
                        console.log("预算不足，计划被暂停"); 
                        await this.changeCampaignStatus('pause'); //TODO 此处并没有暂停人群，所以需要在开始的地方将人群设置为最低出价
                        return "预算不足，计划被暂停";//循环终止
                    }

                    let beginStartStatus:any = null;//是否开启，针对的是状态
                    //如果最后执行时间不是今天，则更新数据库数据状态，
                    if(stageInfo.f_crawl_date != format(new Date(),'yyyy-MM-dd')){
                        //获取计划下 所有单元对应的阶段初始消耗(单位：元)
                        let adGroupCostArr:any = await this.getAdGroupCostData();
                        stageInfo.f_start_charge = campaignCost;//将计划阶段初始消耗修改
                        stageInfo.f_crowd_start_charge = adGroupCostArr;//将计划下的单元阶段初始消耗修改
                        await this.updateAutoMaticData(stageInfo); //修改阶段信息的相关信息
                        console.log("将计划开启");
                        await this.changeCampaignStatus('start'); //将计划开启
                        beginStartStatus = true;//将阶段初始状态改为开始
                    }

                    stageInfo.timeBudget = _.round(stageInfo.timeBudget/adgroupInfos[campaignId].length);//重新计算当前计划下的每个单元对应的预算 
                    
                    //循环处理每个单元
                    for(let adgroupInfo of adgroupInfos[campaignId]){
                        this.strategyData.adgroup_id = adgroupInfo.adgroup_id;//为通用字段单元id赋值
                        //实例化实时数据类 
                        let fliterData = await this.instanceTaobaoFeedflowItemCrowdRpthourlistClass();
                        //人群存储在mongo中的最后一次出价（或展现）,
                        const lastResult = await this.getLastData(fliterData,stageInfo.beginStart); 

                        //人群实时数据
                        const rptDataResult = await this.getRptData(fliterData);
                        //如果出错 跳出本次循环
                        if(rptDataResult.error_response){
                            console.log(rptDataResult.error_response);//单元下的人群实时数据出错，跳出循环
                            continue;
                        } 
                        //处理数据 计算人群出价
                        let crowdModifyRequest = await this.makeCrowdPrice(rptDataResult,lastResult,stageInfo,beginStartStatus); 
                        console.log(crowdModifyRequest);                    
                        //判断是否有需要修改的数据
                        await this.updateCrowdInfo(crowdModifyRequest);
                    }
                }
            }
        } 
        return "改价执行完成";
    }

    public handle():void{
        // 获取人群数据筛选出结果数据,返回的仍然是个promise对象
        const adjuster = this.adjuster();
        adjuster.then(function (data) {
            console.log(data);
        });
    }
}

// token ： 6201f1214b9694e9088bdf0d4d2505a2fbd23a1efe1d634835086076
// 计划id ： 2136965458
// 单元id：2618700059
// 预算：100
// 旺旺：卡莫妮旗舰店

// const test = new AverageTimeStrategyClass(strategyData);
const test = new AverageTimeStrategyClass();
// test.handle();

// 没两分钟执行一次的定时任务
let i = 0;
setInterval(function () {
    console.log(i,new Date(),'----------------------------------------------');
    i++;
    test.handle();
},1000*excuteMinutes*60)


