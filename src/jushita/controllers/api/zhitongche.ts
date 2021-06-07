import {ApiClient} from "../../../libs/apiClient";
import {ZhitongcheConfig} from "../../../config";
import { Request, Response} from 'express';
const zhitongcheClient  = new ApiClient( { app_key:ZhitongcheConfig.app_key, app_secret:ZhitongcheConfig.app_secret});

// 直通车api接口默认方法
const index = function (req:Request, res:Response) {
    const data = req.body;
    data.session = '6202806718a2bbdfc4f61fd525e4b0c58506e7709225de026151499';
    const result = zhitongcheClient.execute(data.method, data.params, data.session);
    result.then(function (data:any) {
        res.json(data);
    });
};

export { index }
