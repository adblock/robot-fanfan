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
//计划状态
let campaignPauseStatus:{[key:string]:{changeStatusPause:boolean}};

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
    let campaignTimesData:object[] = await MysqlClientInstance.table('t_automatic_operation_spider').where(where).select();
    //返回
    return campaignTimesData;
}

/**
 * 获取订单在boss投放状态
 * @param campaignTimesDataInfo 数据库调价的阶段数据
 * @returns 
 */
async function getOrderStatus(campaignTimesDataInfo:object[]) {
    let campaignGroupArr:{[key:string]:any[]} = _.groupBy(campaignTimesDataInfo,'f_wangwang');//按照旺旺分组
    let wangwangIdArr:string[] = Object.keys(campaignGroupArr);//取旺旺数组
    let MysqlClientInstance = BossMysql;
    //将数组转换为字符串
    let where:any = `f_foreign_sku_kind = '超级推荐' and f_copy_wangwangid in ('${wangwangIdArr.join("','")}') and f_foreign_order_state_id = ${orderRunState} `;//查询条件 投放中 类型对，旺旺对
    //查询数据
    let orderData:object[] = await MysqlClientInstance.table('t_order').where(where).select();
    //按照旺旺分组
    let orderDataGroup:{[key:string]:any[]} = _.groupBy(orderData,'f_copy_wangwangid');
    //返回
    return orderDataGroup;
}

/**
 * 修改超级推荐内容
 * @param campaignTimesData 计划信息
 */
async function ChangeChaoTui(campaignTimesData:any,orderDataGroup:{[key:string]:any[]}) {
    if(orderDataGroup[campaignTimesData.f_wangwang] !== undefined){//存在boss中投放的数据则修改
        let campaignMysqlPauseStatus:boolean = false;//判断是否需要修改数据库中的计划状态为暂停
        //如果为在投放中 并且不是暂停状态,则修改为在暂停
        if((campaignTimesData.f_start >= nowTimeTmp || campaignTimesData.f_end <= nowTimeTmp) && campaignTimesData.f_status != 'pause'){
            campaignMysqlPauseStatus = true;
        }
        // 实例化
        let averageTimeStrategy = new AverageTimeStrategyClass(campaignTimesData,excuteMinutes,campaignPauseStatus,campaignMysqlPauseStatus);
        //调用方法
        averageTimeStrategy.handle();
    }
}

/**
 * 计算计划暂停状态是否修改 此处对应的是淘宝API,而非接口
 * @param campaignTimesDataInfo 计划自动改价信息
 * @returns 
 */
async function getCampaignPauseStatus(campaignTimesDataInfo:object[]) {
    let campaignGroupArr:{[key:string]:any[]} = _.groupBy(campaignTimesDataInfo,'f_campaign_id');//根据计划分组
    let campaignPauseStatus:{[key:string]:{changeStatusPause:boolean}} = {};
    Object.keys(campaignGroupArr).forEach((campaignGroupArrValue:string) => {//循环计划
        let flag:boolean = true;
        campaignGroupArr[campaignGroupArrValue].forEach((campaignValue:{[key:string]:any}) => {
            if(flag){//如果存在当前时间内的阶段改价数据，则停止循环
                if(campaignValue.f_start <= nowTimeTmp && campaignValue.f_end >= nowTimeTmp){
                    campaignPauseStatus[campaignGroupArrValue] = {changeStatusPause:false}
                    flag = false;
                }else{//如果不存在，则确定修改计划的状态为暂停
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
    let campaignTimesDataInfo:object[] = await getCampaignTimesData();
    //给计划最终修改状态赋值
    campaignPauseStatus = await getCampaignPauseStatus(campaignTimesDataInfo);
    //获取在boss中的状态
    let orderDataGroup:{[key:string]:any[]} = await getOrderStatus(campaignTimesDataInfo);
    //循环处理每个计划
    campaignTimesDataInfo.forEach(async ( campaignTimesData:any,key:any) =>  {
        // 获取boss中的服务状态，投放则继续，暂停则跳过
        await ChangeChaoTui(campaignTimesData,orderDataGroup); //修改超推相关数据,其余类型类似，或者改为strategyArr方式
    });
    i++;
},1000*excuteMinutes*60); //没excuteMinutes分钟执行一次




