import {ApiClient} from "../../../libs/apiClient";
import {ZhitongcheConfig} from "../../../config";

const zhitongcheClient  = new ApiClient( { app_key:ZhitongcheConfig.app_key, app_secret:ZhitongcheConfig.app_secret});

// 直通车api接口默认方法
const index = function (req:any, res:any) {
    const data = req.body;
    const result = zhitongcheClient.execute(data.method,data.params);
    result.then(function (data:any) {
        res.json(data);
    });
}

export { index }
