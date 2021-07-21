/*
 * @Author: xingchen
 * @Date: 2021-07-13 16:31:16
 * @LastEditTime: 2021-07-21 16:31:30
 * @Description: mysql的客户端类 参考链接：https://www.npmjs.com/package/@hyoga/mysql
 */

import { MysqlConfig } from '../config/mysql';
import Mysql from "@hyoga/mysql"

class Client {
    public mysql:any; //数据库
    public connected = false; //是否连接
    private mysqlConfigData:any ;//配置

    constructor(DBName:string){
        //数据库连接
        // let odlConfig = this.mysqlConfigData;
        this.mysqlConfigData = {
            host: MysqlConfig.host,
            user: MysqlConfig.user,
            password: MysqlConfig.password,
            database: DBName,
            port: MysqlConfig.port,
        };
        // if(!this.connected || DBName != odlConfig.database){//如果未连接 或者切换数据库，则连接
        if(!this.connected){//如果未连接 或者切换数据库，则连接
            this.mysql = new Mysql(this.mysqlConfigData);
            this.connected = true;
            // return this.mysql;
        }
    }
}
const ZhiZuanMysql = new Client('jupin_zhizuan').mysql;
const BossMysql = new Client('Jupin_erp_business').mysql;

export { ZhiZuanMysql, BossMysql};
