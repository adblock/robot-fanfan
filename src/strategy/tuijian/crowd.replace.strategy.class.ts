/*
 * @Author: xingchen
 * @Date: 2021-06-24 13:51:38
 * @LastEditTime: 2021-07-27 10:54:58
 * @Description: 定时轮替单元人群的策略
 */

import _, { unset } from 'lodash';
import { TaobaoFeedflowItemAdgroupPageClass } from '../../api/tuijian/taobao.feedflow.item.adgroup.page.class';
import { TaobaoFeedflowItemOptionPageClass } from '../../api/tuijian/taobao.feedflow.item.option.page.class';
import { TaobaoFeedflowItemTargetValidlistClass } from '../../api/tuijian/taobao.feedflow.item.target.validlist.class';
import { StrategyInterface } from '../strategy.interface';

export class CrowdReplaceStrategyClass implements StrategyInterface {
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
            wangwangid:string,
            adgroup_id:number,
        }
    ){
        // 设置策略数据
        this.strategyData = strategyData;
    }

    /**
     * 获取计划下的定向列表
     * @returns 
     */
    public async getTargetData() {
        let request = {
            'campaign_id': this.strategyData.campaign_id
        }
        //获取计划下有权限的定向列表
        let targetValidlist = new TaobaoFeedflowItemTargetValidlistClass(request,this.strategyData.wangwangid);
        let targetData = await targetValidlist.getResponse();
        //处理数据
        targetData = targetData.feedflow_item_target_validlist_response.result.targets.target_dto;
        return targetData;
    }

    /**
     * 获取计划下的定向列表
     * @returns 
     */
    public async getAdgroupPageData() {
        let request = {
            adgroup_id_list:[this.strategyData.adgroup_id],
            campaign_id_list:[this.strategyData.campaign_id]
        }
        //获取计划下的所有的单元id
        let adgroupPageData = new TaobaoFeedflowItemAdgroupPageClass(request,this.strategyData.wangwangid);
        let adgroupData = await adgroupPageData.getResponse();
        //处理数据
        adgroupData = adgroupData.feedflow_item_adgroup_page_response.result.results.adgroup_d_to;
        return adgroupData;
    }

    /**
     * 获取计划下的定向列表
     * @returns 
     */
    public async getOptioPageData(optionLabelQuery:any) {
        let request = {
            'label_query': optionLabelQuery
        }
        //获取计划下的所有的单元id
        let optionPage = new TaobaoFeedflowItemOptionPageClass(request,this.strategyData.wangwangid);
        let optionPageData = await optionPage.getResponse();
        //处理数据
        optionPageData = optionPageData.feedflow_item_option_page_response.result.labels.label_dto;
        // console.log(optionPageData[0].options.option_dto);
        console.log(optionPageData[0].label_value);
        return optionPageData;
    }



    //操作数据替换
    public async replace(){
        //获取定向数据
        let targetData = await this.getTargetData();

        //获取计划推广单元下的宝贝
        let adgroupPageData = await this.getAdgroupPageData();
        // console.log(adgroupPageData)
        adgroupPageData = _.map(adgroupPageData,'item_id');//以宝贝id简化数组

        // let optionLabelQuery = {
        //     target_id: 521,
        //     target_type: 'LOOK_LIKE_ITEM',
        //     item_id_list: [ 616812054093 ]
        // };//定义标签列表查询参数

        // this.getOptioPageData(optionLabelQuery)

        // console.log(targetData)

        //循环处理数据，拼凑标签列表查询条件
        targetData.forEach((value:any,key:any) => {
            if(value.target_type !== undefined){ 
                let optionLabelQuery = {
                    target_id : value.target_id,
                    target_type : value.target_type,
                    item_id_list : adgroupPageData,
                };
                // console.log(optionLabelQuery)
                this.getOptioPageData(optionLabelQuery)
            }
        });

        // console.log(Object.values(optionLabelQuery));
    }

    public handle():void{
        const replace = this.replace();
        // CATEGORY_BUY_INTEREST
        console.log(123);
    }
}

const strategyData  =  {
    campaign_id:2136965458,
    adgroup_id:2618700059,
    wangwangid:'卡莫妮旗舰店',
    // total_budget:20000 //单位是分
};

// token ： 6201f1214b9694e9088bdf0d4d2505a2fbd23a1efe1d634835086076
// 计划id ： 2136965458
// 单元id：2618700059
// 预算：100
// 旺旺：卡莫妮旗舰店

const test = new CrowdReplaceStrategyClass(strategyData);
test.handle();

//没两分钟执行一次的定时任务
// let i = 0;
// setInterval(function () {
//     console.log(i,new Date(),'----------------------------------------------');
//     i++;
//     test.handle();
// },1000*2*60)


