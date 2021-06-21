/**
 * redis的客户端类
 *
 * **/

import { RedisConfig } from '../config/redis';
import CryptoJS from 'crypto-js';
import Redis from "ioredis";

class Client {
    private redis:any;
    public cache_key = 'API_CACHE';
    public connected = false;
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
        if(!this.connected){
            this.redis = new Redis(redisConfig);
            this.connected = true;
        }
    }

    /**
     * 设置缓存
     * @params data any 存储到缓存的数据
     * @params expire number 过期时间
     * @return void
     * **/
    public async setCache(key:string|object,data:any,expire:number=RedisConfig.default_expire){
        let _key = '';
        if(typeof key === "object") {
            _key = JSON.stringify(key);
        }else {
            _key = key;
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
    public async getCache(key:string|object){
        let _key = '';
        if(typeof key === "object"){
            _key = JSON.stringify(key);
        }else {
            _key = key;
        }
        _key = CryptoJS.MD5(_key).toString();
        const result = await this.redis.get(`${this.cache_key}_${_key}`);
        if(result){
            return JSON.parse(result);
        }else {
            return result;
        }
    }
}
export const RedisClient = new Client();
