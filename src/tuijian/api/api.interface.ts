/**
 * Adjuster 类接口 构造API请求的必须数据
 * 
 **/
export interface ApiInterface {
    api:string;    // 淘宝API的名称，发送请求的必须字段
    request:any;   // 发送给接口的数据
    reponse:any;   // 接口返回的数据
    setRequest(params:any):void; // 设置请求参数
    getResponse():any; // 设置请求参数
}