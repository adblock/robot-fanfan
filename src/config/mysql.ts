/*
 * @Author: xingchen
 * @Date: 2021-07-13 16:41:42
 * @LastEditTime: 2021-07-13 16:50:08
 * @Description: mysql配置
 */
import { env } from '../env/env'

const MysqlConfig = {
    host: 'mysql_host' in env ? env.mysql_host : '127.0.0.1',
    port: 'mysql_port' in env ? env.mysql_port : 3306,
    password: 'mysql_password' in env ? env.mysql_password : null,
    user: 'mysql_user' in env ? env.mysql_user : null,
    database: 'mysql_db' in env ? env.mysql_db : null,
}

export {MysqlConfig};
