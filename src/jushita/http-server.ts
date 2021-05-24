import express from 'express';
import { ApiClient } from '../libs/apiClient';
import { TuijianApiConfig } from '../config';
import { ZhitongcheConfig } from '../config';

const zhitongcheClient  = new ApiClient( { app_key:ZhitongcheConfig.app_key, app_secret:ZhitongcheConfig.app_secret});
const tuijianClient  = new ApiClient( { app_key:TuijianApiConfig.app_key, app_secret:TuijianApiConfig.app_secret});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 判断接口数据是否正确
app.use('/api',function (req:any, res:any,next:any) {
    // 跨域
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    const data = req.body;
    if(!data.hasOwnProperty('nick_name')){
        res.json({error:'no nick_name'});
    }
    if(!data.hasOwnProperty('method')){
        res.json({error:'no method'});
    }
    if(!data.hasOwnProperty('params')){
        res.json({error:'no params'});
    }
    if(data.hasOwnProperty('nick_name') && data.hasOwnProperty('method') && data.hasOwnProperty('params')){
        data.method = 'taobao.httpdns.get'
        next();
    }
});

app.post('/api/zhitongche', function (req:any, res:any) {
    const data = req.body;
    console.log(data.method);
    const result = zhitongcheClient.execute(data.method,{});
    result.then(function (data:any) {
        res.json(data);
    });
});

app.post('/api/tuijian', function (req:any, res:any) {
    const data = req.body;
    console.log(data.method);
    const result = tuijianClient.execute(data.method,{});
    result.then(function (data:any) {
        res.json(data);
    });
});
app.listen(3000);
