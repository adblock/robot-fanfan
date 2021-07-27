/*
 * @Author: xingchen
 * @Date: 2021-06-08 10:36:45
 * @LastEditTime: 2021-07-27 14:36:21
 * @Description: 
 */
import  format from 'date-fns/format';
import { ZhiZuanMysql, BossMysql } from '../libs/mysqlClient';
import _ from 'lodash';
import { AverageTimeStrategyClass } from '../strategy/tuijian/average.time.strategy.class';

//当前时间
let nowTimeTmp:string;
const f_type:string = 'chaotui'; //当前文件对应的类型
const excuteMinutes:number = 3;//执行频率（单位：分钟）
const orderRunState:number = 2;//订单投放中状态

/**
 * 获取计划投放时段数据,型数据库获取
 * @returns 
 */
 async function getCampaignTimesData(){
    let MysqlClientInstance = ZhiZuanMysql;
    let where:string = `f_type = '${f_type}' and ((f_start <= '${nowTimeTmp}' and f_end >= '${nowTimeTmp}') or ((f_start >= '${nowTimeTmp}' or f_end <= '${nowTimeTmp}') and f_status != 'pause'))`;
    //查询数据
    let campaignTimesData:object[] = await MysqlClientInstance.table('t_automatic_operation_spider').where(where).select('');
    //返回
    return campaignTimesData;
}
/**
 * 获取订单在boss投放状态
 * @params campaignTimesDataInfo 计划自动改价信息
 * @returns
 */
async function getOrderStatus(campaignTimesDataInfo:object[]) {
    let campaignGroupArr:{[key:string]:any[]} = _.groupBy(campaignTimesDataInfo,'f_wangwang');//按照旺旺分组
    let wangwangIdArr:string[] = Object.keys(campaignGroupArr);//取旺旺数组
    let MysqlClientInstance = BossMysql;
    //将数组转换为字符串
    let where:any = `f_foreign_sku_kind = '超级推荐' and f_copy_wangwangid in ('${wangwangIdArr.join("','")}') and f_foreign_order_state_id = ${orderRunState} `;//查询条件 投放中 类型对，旺旺对
    //查询数据
    let orderData:object[] = await MysqlClientInstance.table('t_order').where(where).select('');
    //返回
    return orderData;
}

/**
 * 获取订单在boss投放状态
 * @param campaignTimesDataInfo 计划自动改价信息
 * @returns
 */
async function getMysqlPauseStatus(campaignTimesDataInfo:object[]) {
    let orderData = await getOrderStatus(campaignTimesDataInfo);
    let orderDataGroup:{[key:string]:any[]} = _.groupBy(orderData,'f_copy_wangwangid');
    // result
    let mysqlPauseStatus:{[key:string]:{changeStatusPause:string}} = {};
    //
    campaignTimesDataInfo.forEach((campaignTimesData:any) =>  {
        mysqlPauseStatus[campaignTimesData.id] = {changeStatusPause:'start'}; //
        if(orderDataGroup[campaignTimesData.f_wangwang] !== undefined){//存在boss中投放的数据则修改
            if((campaignTimesData.f_start >= nowTimeTmp || campaignTimesData.f_end <= nowTimeTmp) && campaignTimesData.f_status != 'pause'){
                mysqlPauseStatus[campaignTimesData.id] = {changeStatusPause:'pause'}
            }
        }
    });
    return mysqlPauseStatus;
}
/**
 * 计算计划暂停状态是否修改 此处对应的是淘宝API,而非接口
 * @param campaignTimesDataInfo 计划自动改价信息
 * @returns 
 */
async function getCampaignPauseStatus(campaignTimesDataInfo:object[]) {
    let campaignGroupArr:{[key:string]:any[]} = _.groupBy(campaignTimesDataInfo,'f_campaign_id');//根据计划分组
    let campaignPauseStatus:{[key:string]:{changeStatusPause:string}} = {};
    Object.keys(campaignGroupArr).forEach((campaignGroupArrValue:string) => {//循环计划
        let flag:boolean = true;
        campaignGroupArr[campaignGroupArrValue].forEach((campaignValue:{[key:string]:any}) => {
            if(flag){//如果存在当前时间内的阶段改价数据，则停止循环
                if(campaignValue.f_start <= nowTimeTmp && campaignValue.f_end >= nowTimeTmp){
                    campaignPauseStatus[campaignGroupArrValue] = {changeStatusPause:'start'};
                    flag = false;
                }else{//如果不存在，则确定修改计划的状态为暂停
                    campaignPauseStatus[campaignGroupArrValue] = {changeStatusPause:'pause'};
                }
            }
        });
    });
    return campaignPauseStatus;
}

/**
 * 获取自动操作相关的数据
 *
 * */
async function getAutoOption(){
    //从数据库获取按照旺旺和计划分组的数据;
    let campaignTimesDataInfo:object[] = await getCampaignTimesData();
    let autoOption:{
        campaignTimesDataInfo:object[],
        campaignStatus:{[key:string]:{changeStatusPause:string}},
        mysqlStatus:{[key:string]:{changeStatusPause:string}},
    } = {
        campaignTimesDataInfo:[],
        campaignStatus:{},
        mysqlStatus:{},
    };
    autoOption.campaignTimesDataInfo = campaignTimesDataInfo;
    autoOption.campaignStatus = await getCampaignPauseStatus(campaignTimesDataInfo);
    autoOption.mysqlStatus = await getMysqlPauseStatus(campaignTimesDataInfo);
    return autoOption;
}

/**
 * run
 * */
async function run(){
    nowTimeTmp = format(new Date(), 'HH:mm:ss');//为当前时间变量赋值
    console.log(nowTimeTmp);
    let autoOption = await getAutoOption();
    console.log(autoOption);
    autoOption.campaignTimesDataInfo.forEach((campaignTimesData:any) =>  {
        let averageTimeStrategy = new AverageTimeStrategyClass(
            campaignTimesData,
            excuteMinutes,
            autoOption.campaignStatus[campaignTimesData.f_campaign_id].changeStatusPause,
            autoOption.mysqlStatus[campaignTimesData.id].changeStatusPause,
        );
        // 调用方法
        averageTimeStrategy.handle();
    });
}

/**
 * 定时器
 * */
let i = 1; //定义第几次执行
let interval = setInterval(async () => {
    console.log('正在进行第'+ i + '次改价');
    await run();
    i++;
},1000*excuteMinutes*60); //没excuteMinutes分钟执行一次




