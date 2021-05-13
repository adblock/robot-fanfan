/**
 * Adjuster 类接口 构造API请求的必须数据
 * 
 **/
export interface AdjusterInterface {
    api:string; // 淘宝API的名称，发送请求的必须字段
    data:any;   // 发送的接口数据，接口需要的数据
}