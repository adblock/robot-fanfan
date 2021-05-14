/**
 * StrategyInterface 
 * 
 * 策略类的接口，约定一个handle方法，返回一个AdjusterInterface类
 * */
import { ApiInterface } from '../api/api.interface';
export interface StrategyInterface {
    strategyData:object;
    fliterData:any;
    adjusteData:any;
    handle():ApiInterface;
}