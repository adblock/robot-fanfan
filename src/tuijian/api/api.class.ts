/**
 * API 类基类 构造一个TopClient
 * 
 **/
import { ApiClient } from '../../libs/apiCliet';
import { ApiConfig } from '../config/api';

export class ApiClass {
    public client;
    constructor(){
        this.client = new ApiClient({
            app_key:ApiConfig.app_key,
            app_secret:ApiConfig.app_secret
        });
    }
}