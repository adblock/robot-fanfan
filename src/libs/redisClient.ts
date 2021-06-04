import { RedisConfig } from '../config/redis';
import CryptoJS from 'crypto-js';
import Redis from "ioredis";

export class RedisClient {
    private redis:any;
    public cache_key = 'API_CACHE'
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
        this.redis = new Redis(redisConfig);
    }

    /**
     * 设置缓存
     * @params data any 存储到缓存的数据
     * @params expire number 过期时间
     * @return void
     * **/
    public async setCache(key:any,data:any,expire:number=RedisConfig.default_expire){
        let _key = key;
        // 判断输入的key的类型
        if(key instanceof String){
            _key = key ;
        }
        if(key instanceof Object){
            _key = JSON.stringify(key);
        }
        _key = CryptoJS.MD5(_key).toString();
        await this.redis.set(`${this.cache_key}_${_key}`,JSON.stringify(data));
        await this.redis.expire(`${this.cache_key}_${_key}`,expire);
    }
    /**
     * 获取缓存
     * @params key any 获取数据的key
     * @return any
     * **/
    public async getCache(key:any){
        let _key = key;
        // 判断输入的key的类型
        if(key instanceof String){
            _key = key ;
        }
        if(key instanceof Object){
            _key = JSON.stringify(key);
        }
        _key = CryptoJS.MD5(_key).toString();
        const result = await this.redis.get(`${this.cache_key}_${_key}`);
        if(result){
            return JSON.stringify(result);
        }else {
            return result;
        }
    }
}
