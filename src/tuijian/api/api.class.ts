/**
 * API 类基类 构造一个TopClient
 * 
 **/
import { ApiClient } from '../../libs/apiClient';
import { RedisClient } from '../../libs/redisClient';

export class ApiClass {
    public topClient;
    public redisClient;
    public api:string = '';
    constructor(){
        // redis 客户端
        this.redisClient = new RedisClient;
        // TOP 客户端
        this.topClient = new ApiClient;
    }
    /**
     * 发送请求的方法
     * @params params any 参数
     * **/
    public execute(params:any){
        return this.topClient.execute(this.api, params);
    }
}
