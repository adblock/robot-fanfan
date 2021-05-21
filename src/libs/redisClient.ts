import { RedisConfig } from '../config/redis';
import redis from "redis";

export class RedisClient {
    public client;
    constructor(){
        // redis 客户端
        let redisConfig:any = {
            host:RedisConfig.host,
            port:RedisConfig.port,
            db:RedisConfig.db,
        };
        if(RedisConfig.password !== null){
            redisConfig.password = RedisConfig.password;
        }
        this.client = redis.createClient(redisConfig);
    }
    // 设置缓存
    public setCache(data:any,expire:number){

    }
    // 获取缓存
    public getCache(key:any){

    }
}
