/*
 * @Author: xingchen
 * @Date: 2021-07-13 16:31:16
 * @LastEditTime: 2021-07-14 10:18:09
 * @Description: mysql的客户端类 参考链接：https://www.npmjs.com/package/@hyoga/mysql
 */

import { MysqlConfig } from '../config/mysql';
import Mysql from "@hyoga/mysql"

class Client {
    public mysql:any;
    public connected = false;
    private mysqlConfig:any ;
    constructor(){
        // mysql 客户端
        this.mysqlConfig = {
            host: MysqlConfig.host,
            user: MysqlConfig.user,
            password: MysqlConfig.password,
            database: MysqlConfig.database,
            port: MysqlConfig.port,
        };
       
        if(!this.connected){
            this.mysql = new Mysql(this.mysqlConfig);
            this.connected = true;
        }
    }
}
const MysqlClient = new Client();
export { MysqlClient };

/**
 *         // campaign_id:2173812989,
        // beginStart:format(new Date(),'yyyy-MM-dd 00:00:00'),
        // beginEnd:format(new Date(),'yyyy-MM-dd 06:59:59'),
        // // adgroup_id:2651692616,
        // wangwangid:'卡莫妮旗舰店',
        // time_budget:5000, //时段对应的预算
        // f_start_charge:0,//阶段初始消耗
        // f_crawl_date:'2021-07-12',//最后执行日期

                // yyyy-MM-dd HH:mm:ss
 */
