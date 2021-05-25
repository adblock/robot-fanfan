/**
 * API 类基类 构造一个TopClient
 * 
 **/
import {ApiClass} from "../api.class";
import { TuijianApiConfig } from '../../config';

export class TuijianApiClass extends ApiClass {
    constructor(){
        super(TuijianApiConfig.app_key,TuijianApiConfig.app_secret)
    }
}
