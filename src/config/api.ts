import { env } from '../env/env'
const API_URL = 'http://gw.api.taobao.com/router/rest';
const TuijianApiConfig = {
    app_key: env.tuijian_app_key,
    app_secret: env.tuijian_app_secret,
}

export {TuijianApiConfig, API_URL};
