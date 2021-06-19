
/**
 * 存储数到mongo
 * @params params  不同平台不同的查询条件 { wangwang:'1',corwd_id:1, campaign_id:1 }
 * @params data    需要存储的数据
 * */
import {subMinutes} from "date-fns";
import { mongoClient } from '../libs/mongoClient';

async function saveApiToMongodata(params:any, data:any, apiName:string, wangwang:string){
    if(data === undefined){
        return { n: 0, ok: 0};
    }else {
        // 根据api名称构造存储数据的表命
        const collectionName = apiName + '.logs';
        const mongoClientInstance = mongoClient;
        await mongoClientInstance.getDB();
        const currentDateTime = new Date();
        // 存入一些数据
        let saveData = params;
        saveData.wangwang = wangwang;
        saveData.data = data;
        saveData.created_at = currentDateTime;
        saveData.updated_at = currentDateTime;
        const result = await mongoClientInstance.database.collection(collectionName).insertOne(saveData);
        return result.result;
    }
}

/**
 * 获取某些事件之前的最后一条数据mongo
 * @params params   不同平台不同的查询对象  { wangwang:'1',corwd_id:1, campaign_id:1 }
 * @params diffTime 分钟多长时间之前
 * */
async function  getApiFormMongo(params:any, diffTime:number, apiName:string, wangwang:string){
    if(diffTime === undefined || params === undefined || apiName === undefined ){
        return [];
    }else {
        const collectionName = apiName + '.logs';
        const mongoClientInstance = mongoClient;
        await mongoClientInstance.getDB();

        const queryDiffTime = subMinutes(new Date(), diffTime);
        let query = {
            wangwang: wangwang,
            created_at : {$lte:queryDiffTime}
        };
        Object.assign(query, params);
        const result = await mongoClientInstance.database.collection(collectionName).find(query)
            .sort({'created_at':-1})
            .limit(1)
            .toArray();
        return result;
    }
}
