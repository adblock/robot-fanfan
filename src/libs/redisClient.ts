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
        this.client.on("error", function(error) {
            console.error('error');
        });
        this.client.on("ready", (error) =>{
            console.error('ready');
        });

    }

    /**
     * 设置缓存
     * @params data any 存储到缓存的数据
     * @params expire number 过期时间
     * @return void
     * **/
    public setCache(data:any,expire:number){
        this.client.set("aldjalksjasdasdasdlaksj", "{asdasd:asdasdasdas}");
        this.client.get("foo",function (err, data) {
            console.log(data);
        });
    }
    /**
     * 获取缓存
     * @params key any 获取数据的key
     * @return any
     * **/
    public getCache(key:any){

    }
}
