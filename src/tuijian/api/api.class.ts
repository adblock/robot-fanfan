/**
 * API 类基类 构造一个TopClient
 * 
 **/
import { ApiClient } from '../../libs/apiClient';
import { RedisClient } from '../../libs/redisClient';
import { TuijianApiConfig } from '../../config/api';

export class ApiClass {
    public client;
    public redisClient;
    constructor(){
        // TOP客户端
        this.redisClient = new RedisClient;
        console.log(this.redisClient);
        this.client = new ApiClient({
            app_key:TuijianApiConfig.app_key,
            app_secret:TuijianApiConfig.app_secret
        });
    }
}
