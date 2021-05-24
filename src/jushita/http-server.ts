import express from 'express';
import { ApiClient } from '../libs/apiClient';
import { TuijianApiConfig, ZhitongcheConfig, JushitaConfig } from '../config';

const zhitongcheClient  = new ApiClient( { app_key:ZhitongcheConfig.app_key, app_secret:ZhitongcheConfig.app_secret});
const tuijianClient  = new ApiClient( { app_key:TuijianApiConfig.app_key, app_secret:TuijianApiConfig.app_secret});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',function (req:any, res:any,next:any) {
    // 跨域
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    const data = req.body;
    if(data.hasOwnProperty('nick_name') && data.hasOwnProperty('method') && data.hasOwnProperty('params')){
        data.method = 'taobao.httpdns.get'
        next();
    }else {
        res.status(500).json({error:'no nick_name,method,params'});
    }
});

app.post('/api/zhitongche', function (req:any, res:any) {
    const data = req.body;
    const result = zhitongcheClient.execute(data.method,data.params);
    result.then(function (data:any) {
        res.json(data);
    });
});

app.post('/api/tuijian', function (req:any, res:any) {
    const data = req.body;
    const result = tuijianClient.execute(data.method,data.params);
    result.then(function (data:any) {
        res.json(data);
    });
});

app.listen(JushitaConfig.listen_port,JushitaConfig.listen_ip,function () {
    console.log(JushitaConfig.listen_ip,JushitaConfig.listen_port);
});
