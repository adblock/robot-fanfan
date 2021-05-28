/*
@File     ：zhitongche.api.class.py
@Author   ：qingyang
@Date     ：2021/5/25 10:49 
@describe ：API 类基类 构造一个TopClient(直通车)
*/

import { ApiClass } from "../api.class";
import { ZhitongcheConfig } from '../../config';

export class ZhitongcheApiClass extends ApiClass {
    constructor(){
        super(ZhitongcheConfig.app_key,ZhitongcheConfig.app_secret)
    }
}