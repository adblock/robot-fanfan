/**
 * 将策略key-value的export以供程序调用
 * **/
import { AverageCostStrategyClass } from "./tuijian/average.cost.strategy.class";
import { ZtcAverageCostStrategyClass } from "./zhitongche/average.cost.strategy.class";

const strategyList = {
    'tuijian':{
        'average.cost.strategy': AverageCostStrategyClass, // 定向平均花费
    },
    'zhitongche': {
        'average.cost.strategy': ZtcAverageCostStrategyClass,   // 直通车出价策略之一：平均花费
    }
};

export { strategyList };

