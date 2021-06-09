/**
 * API 类基类 构造一个TopClient
 * 
 **/
import { ApiClient } from '../libs/apiClient';
import { RedisClient } from '../libs/redisClient';


export class ApiClass {
    public topClient;
    public redisClient;
    public api:string = '';
    constructor(app_key:string, app_secret:string){
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
        let session = '6202806718a2bbdfc4f61fd525e4b0c58506e7709225de026151499';
        return this.topClient.execute(this.api, params, session);
    }
}
