/**
 * 将策略key-value的export以供程序调用
 * **/
import { AverageCostStrategyClass } from "./average.cost.strategy.class"

const strategyList = {
    'average.cost.strategy': AverageCostStrategyClass, // 定向平均花费
}

export { strategyList };

