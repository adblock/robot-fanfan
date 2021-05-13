/**
 * CrowdsModifyBindAdjusterClass 
 * 
 * 修改人群接口的实例类，处理策略传入的数据构造成，接口文档要求的数据结构
 * 
 * */

import { AdjusterInterface } from "./adjuster.interface";

export class CrowdsModifyBindAdjusterClass implements AdjusterInterface {
    
    // 构造的数据结构
    public data:{
        crowds: {
            price:number,
            status:string,
            crowd_id:number,
        }[];
        adgroup_id: number;
    } | undefined;

    // 接口名称
    public api = 'taobao.feedflow.item.crowd.modifybind';
    
    /**
     * 构造数据接受参数的方法
     * price      定向价格
     * status     定向状态
     * crowd_id   定向id
     * adgroup_id 单元id
     * **/
    public add(params:{price:number, status:string, crowd_id:number, adgroup_id:number}):void {
        if(this.data === undefined){
            this.data = {
                crowds:[
                    {
                        price: params.price,
                        status: params.status,
                        crowd_id: params.crowd_id,
                    }
                ],
                adgroup_id: params.adgroup_id,
            }
        }else{
            this.data.crowds.push({
                price:0,
                status:'start',
                crowd_id:0,
            });
        }
    }
}