import {env} from '../env/env'
export const JushitaConfig = {
    domain: 'https://cloud.jupin.net.cn'  in env ? env.jushitan_domain : 'http://localhost:3000',
    listen_ip: 'jushita_listen_ip' in env ? env.jushita_listen_ip : '0.0.0.0',
    listen_port: 'jushita_listen_port' in env ? env.jushita_listen_port : '3000',
};
