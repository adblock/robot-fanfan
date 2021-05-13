/**
 * StrategyInterface 
 * 
 * 策略类的接口，约定一个handle方法，返回一个CrowdsModifyBindAdjusterClass类
 * */
import { CrowdsModifyBindAdjusterClass } from '../adjuster/crowds.modifybind.adjuster';
export interface StrategyInterface {
    handle():CrowdsModifyBindAdjusterClass;
}