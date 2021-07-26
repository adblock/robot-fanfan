/**
 * API 类基类 构造一个TopClient
 * 
 **/
import { ApiClient } from '../libs/apiClient';
import { RedisClient } from '../libs/redisClient';
import { mongoClient } from '../libs/mongoClient';


export class ApiClass {
    public topClient;
    public redisClient;
    public mongoClient;
    public api:string = '';
    constructor(app_key:string, app_secret:string){
        // mongo 客户端
        this.mongoClient = mongoClient;
        // redis 客户端
        this.redisClient = RedisClient;
        // TOP 客户端
        this.topClient = new ApiClient({
            app_key:app_key,
            app_secret:app_secret,
        });
    }
    /**
     * 发送请求的方法
     * @params params any 参数
     * **/
    public async execute(params:any, wangwang:string){
        let session:any = await this.getToken(wangwang);
        if(session){
            session = session.access_token;
            return this.topClient.execute(this.api, params, session);
        }else{
            return { 
                error_response:{ 
                    code: 40,
                    msg: 'token获取失败',
                    request_id: '753894596' 
                }    
            };
        }
    }

    /**
     * 获取getToken
     * getToken
     */
    public async getToken(wangwang:string) {
        const collectionName = 'jushita_tokens';
        await this.mongoClient.getDB();
        const currentDateTime = new Date();
        let query = {
            wangwang_id: wangwang,
        }
        //获取wangwang对应的getToken
        const result = await this.mongoClient.database.collection(collectionName).findOne(query);
        return result;
    }
}
