import axios from "axios";
import { format } from "date-fns";
import querystring from "querystring";
import CryptoJS  from "crypto-js";

export class ApiClient {
    private options:{
        app_key:string,
        app_secret:string,
        url:string;
    };
    
    constructor(options:any){
        if (!options.app_key || !options.app_secret) {
            throw new Error('app_key or app_secret need!');
        }else{
            this.options = {
                app_key:options.app_key,
                app_secret:options.app_secret,
                url:options.url || 'http://gw.api.taobao.com/router/rest'
            }
        };
    }

    // 计算签名
     private signUrl(params:any){
        // 接口参数
        let args:any = {
            timestamp:format(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            format: 'json',
            app_key: this.options.app_key,
            v: '2.0',
            sign_method: 'md5',
        };
        for (var key in params) {
            if(typeof params[key] === 'object'){
                args[key] = JSON.stringify(params[key]);
            } else{
                args[key] = params[key];
            }
        }
        // 计算sign
        let sorted = Object.keys(args).sort();
        let basestring = this.options.app_secret;
        for (var i = 0, l = sorted.length; i < l; i++) {
            var k = sorted[i];
            basestring += k +args[k];
        }
        basestring += this.options.app_secret;
        args.sign = CryptoJS.MD5(basestring).toString().toUpperCase();
        const url = this.options.url+'?'+querystring.stringify(args);
        return url;
    };


    // 执行请求
    public execute(method:string,params:any) {
    params.method = method;
    const url = this.signUrl(params);
    return axios.post(url).then((data)=>{
        return data.data;
    }).catch(data=>{
        console.log(data,'231090192830912893081098310298');
    });
};

}
