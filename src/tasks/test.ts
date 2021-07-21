/*
 * @Author: xingchen
 * @Date: 2021-06-08 10:36:45
 * @LastEditTime: 2021-07-21 16:28:24
 * @Description: 
 */
import { AverageCostStrategyClass } from '../strategy/tuijian/average.cost.strategy.class';
import  format from 'date-fns/format';
import { ZhiZuanMysql, BossMysql } from '../libs/mysqlClient';
import _ from 'lodash';
import { AverageTimeStrategyClass } from '../strategy/tuijian/average.time.strategy.class';

//当前时间
let nowTimeTmp:any;
//计划状态
let campaignPauseStatus:any;

//定义不同类型对应的类
let strategyArr:any = {
    'chaotui':AverageTimeStrategyClass
};

const excuteMinutes:number = 2;//执行频率（单位：分钟）
const orderRunState:number = 2;//订单投放中状态

//定义不同类型对应的boss数据库的中文释义
let skuKind:any = {
    // f_foreign_sku_kind
    'chaotui':'超级推荐'
}

/**
 * 获取计划投放时段数据,型数据库获取
 * @returns 
 */
 async function getCampaignTimesData(){
    let MysqlClientInstance = ZhiZuanMysql;
    let where:any = `(f_start <= '${nowTimeTmp}' and f_end >= '${nowTimeTmp}') or ((f_start >= '${nowTimeTmp}' or f_end <= '${nowTimeTmp}') and f_status != 'pause')`;
    //查询数据
    let campaignTimesData = await MysqlClientInstance.table('t_automatic_operation_spider').where(where).select();
    //返回
    return campaignTimesData;
}

/**
 * 获取订单在boss投放状态
 * @param wangwang 
 * @param type 
 * @returns 
 */
async function getOrderStatus(wangwang:any,type:any) {
    let MysqlClientInstance = BossMysql;
    let where:any = `f_foreign_sku_kind = '${skuKind[type]}' and f_copy_wangwangid = '${wangwang}' and f_foreign_order_state_id = ${orderRunState} `;//查询条件 投放中 类型对，旺旺对
    //查询数据
    let orderData = await MysqlClientInstance.table('t_order').where(where).find();
    //返回
    return orderData;
}

/**
 * 修改超级推荐内容
 * @param campaignTimesData 计划信息
 */
async function ChangeChaoTui(campaignTimesData:any) {
    let orderData = await getOrderStatus(campaignTimesData.f_wangwang,campaignTimesData.f_type);//获取在boss中的状态
    if(orderData !== undefined){//存在boss中投放的数据则修改
        let campaignMysqlPauseStatus:any = false;//判断是否需要修改数据库中的计划状态为暂停
        //如果为在投放中 并且不是暂停状态,则修改为在暂停
        if((campaignTimesData.f_start >= nowTimeTmp || campaignTimesData.f_end <= nowTimeTmp) && campaignTimesData.f_status != 'pause'){
            campaignMysqlPauseStatus = true;
        }
        // 实例化
        let averageTimeStrategy = new strategyArr[campaignTimesData.f_type](campaignTimesData,excuteMinutes,campaignPauseStatus,campaignMysqlPauseStatus);
        //调用方法
        averageTimeStrategy.handle();
    }
}

/**
 * 计算计划暂停状态是否修改
 * @param campaignTimesDataInfo 计划自动改价信息
 * @returns 
 */
async function getCampaignPauseStatus(campaignTimesDataInfo:any) {
    let campaignGroupArr:any = _.groupBy(campaignTimesDataInfo,'f_campaign_id');//根据计划分组
    let campaignPauseStatus:any[]=[];
    Object.keys(campaignGroupArr).forEach((campaignGroupArrValue:any,campaignGroupArrKey:any) => {
        let flag = true;
        campaignGroupArr[campaignGroupArrValue].forEach((campaignValue:any,campaignKey:any) => {
            if(flag){
                if(campaignValue.f_start <= nowTimeTmp && campaignValue.f_end >= nowTimeTmp){
                    campaignPauseStatus[campaignGroupArrValue] = {changeStatusPause:false}
                    flag = false;
                }else{
                    campaignPauseStatus[campaignGroupArrValue] = {changeStatusPause:true}
                }
            }
        });
    });
    return campaignPauseStatus;
}

let i = 1; //定义第几次执行
let interval = setInterval(async function () {
    console.log('正在进行第'+ i + '次改价')
    nowTimeTmp = format(new Date(), 'HH:mm:ss');//为当前时间变量赋值
    //从数据库获取按照旺旺和计划分组的数据;
    let campaignTimesDataInfo = await getCampaignTimesData();
    //给计划最终修改状态赋值
    campaignPauseStatus = await getCampaignPauseStatus(campaignTimesDataInfo);

    //循环处理每个计划
    campaignTimesDataInfo.forEach(async ( campaignTimesData:any,key:any) =>  {
        // 获取boss中的服务状态，投放则继续，暂停则跳过
        if( campaignTimesData.f_type == 'chaotui'){//TODO 改为按照strategyArr格式
            await ChangeChaoTui( campaignTimesData); //修改超推相关数据,其余类型类似，或者改为strategyArr方式
        }
    });
    i++;
},1000*excuteMinutes*60); //没excuteMinutes分钟执行一次


