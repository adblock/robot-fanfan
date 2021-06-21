
/**
 * 存储数到mongo
 * @params params  不同平台不同的查询条件 { wangwang:'1',corwd_id:1, campaign_id:1 }
 * @params data    需要存储的数据
 * */
import {subMinutes} from "date-fns";
import { mongoClient } from '../libs/mongoClient';

/**
 * 存储api数据到mongo
 * @params params { requests:'接口的查询条件', data:'接口数据', apiName:'api的名称', wangwang:'店铺旺旺' }
 * */
async function saveApiToMongodata(params:{requests:any, data:any, apiName:string, wangwang:string}){
    // 根据api名称构造存储数据的表命
    const collectionName = params.apiName + '.logs';
    const mongoClientInstance = mongoClient;
    await mongoClientInstance.getDB();
    const currentDateTime = new Date();
    // 存入一些数据
    let saveData = params.requests;
    Object.assign(saveData,{
        wangwang: params.wangwang,
        data: params.data,
        created_at: currentDateTime,
        updated_at: currentDateTime,
    });

    const result = await mongoClientInstance.database.collection(collectionName).insertOne(saveData);
    return result.result;
}

/**
 * 获取某分钟之前的最后一条数据mongo
 * @params params   不同平台不同的查询对象  { requests:'接口的查询条件', diffTime:'时间差', apiName:'api的名称', wangwang:'店铺旺旺' }
 * */
async function  getApiFormMongoByDiffTime(params:{requests:any, diffTime:number, apiName:string, wangwang:string}){
    const collectionName = params.apiName + '.logs';
    const mongoClientInstance = mongoClient;
    await mongoClientInstance.getDB();

    const queryDiffTime = subMinutes(new Date(), params.diffTime);
    let query = {
        wangwang: params.wangwang,
        created_at : {$lte:queryDiffTime}
    };
    Object.assign(query, params.requests);
    const result = await mongoClientInstance.database.collection(collectionName).find(query)
        .sort({'created_at':-1})
        .limit(1)
        .toArray();
    return result;
}
export {saveApiToMongodata, getApiFormMongoByDiffTime}
