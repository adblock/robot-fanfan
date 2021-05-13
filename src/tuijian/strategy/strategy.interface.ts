/**
 * StrategyInterface 
 * 
 * 策略类的接口，约定一个handle方法，返回一个AdjusterInterface类
 * */
import { AdjusterInterface } from '../adjuster/adjuster.interface';
export interface StrategyInterface {
    handle():AdjusterInterface;
}