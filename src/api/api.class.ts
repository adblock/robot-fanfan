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
    public execute(params:any, wangwang:string){
        // todo 开发一session 先默认为超级女声琳琳
        let session = '62022077d0199a0ZZb43e76a2b5dd2d628f94567aae6db826151499';
        return this.topClient.execute(this.api, params, session);
    }
}

