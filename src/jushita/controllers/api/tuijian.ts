import {ApiClient} from "../../../libs/apiClient";
import {TuijianApiConfig} from "../../../config";
import { Request, Response} from 'express';
const tuijianClient  = new ApiClient( { app_key:TuijianApiConfig.app_key, app_secret:TuijianApiConfig.app_secret});

// 超级推荐api接口默认方法
const index = function (req:Request, res:Response) {
    var data = req.body;
    var result = tuijianClient.execute(data.method, data.params);
    result.then(function (data) {
        res.json(data);
    });
};

export  { index }
