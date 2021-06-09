import {ApiClient} from "../../../libs/apiClient";
import {TuijianApiConfig} from "../../../config";
import { Request, Response} from 'express';
const tuijianClient  = new ApiClient( { app_key:TuijianApiConfig.app_key, app_secret:TuijianApiConfig.app_secret});

// 超级推荐api接口默认方法
const index = function (req:Request, res:Response) {
    var data = req.body;
    // todo 将请求的数据改为 超级女生琳琳token
    data.session = '6202806718a2bbdfc4f61fd525e4b0c58506e7709225de026151499';
    console.log(data);
    var result = tuijianClient.execute(data.method, data.params,  data.session);
    result.then(function (data) {
        res.json(data);
    });
};

export  { index }
