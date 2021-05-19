/**
 * TaobaoFeedflowItemCrowdModifyBindClass
 * 
 * 修改人群出价或状态的类，处理策略传入的数据构造成，接口文档要求的数据结构
 * 文档：https://open.taobao.com/API.htm?docId=43252&docType=2
 * 
 * */

import { ApiInterface } from "./api.interface";
import { ApiClass } from './api.class';

export class TaobaoFeedflowItemCrowdModifyBindClass extends ApiClass implements ApiInterface {
    constructor(){
        super();
    }
    // 接口名称
    public api = 'taobao.feedflow.item.crowd.modifybind';
    // 响应参数
    public reponse:any | undefined;
    // 构造的数据结构
    public request:{
        crowds: {
            price:number,
            status:string,
            crowd_id:number,
        }[];
        adgroup_id: number;
    } | undefined;

    /**
     * 构造数据接受参数的方法
     * price      定向价格
     * status     定向状态
     * crowd_id   定向id
     * adgroup_id 单元id
     * **/
    public setRequest(params:{price:number, status:string, crowd_id:number, adgroup_id:number}):void {
        if(this.request === undefined){
            this.request = {
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
            this.request.crowds.push({
                price:0,
                status:'start',
                crowd_id:0,
            });
        }
    }

    // 获取请求
    public getResponse():any{
        if(this.reponse === undefined){
            this.reponse = this.client.execute('taobao.httpdns.get',{}).then(function (res) {
                // console.log(res,3);
                return res;
            }).catch(data=>{
                console.log(data,'231090192830912893081098310298');
            });
        }
        return this.reponse;
    }
}