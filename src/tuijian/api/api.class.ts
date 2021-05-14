/**
 * API 类基类 构造一个TopClient
 * 
 **/
import TopClient from 'topsdk';
import { ApiConfig } from '../config/api';

export class ApiClass {
    public client;
    constructor(){
        this.client = new TopClient(ApiConfig.app_key,ApiConfig.app_secret);
    }
}