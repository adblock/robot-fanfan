import { ApiClient } from "../../../libs/apiClient";
import { TuijianApiConfig } from "../../../config";
import { Request, Response } from 'express';
import { TokenModel } from '../../models/token';
const tuijianClient = new ApiClient({ app_key: TuijianApiConfig.app_key, app_secret: TuijianApiConfig.app_secret });

// 超级推荐api接口默认方法
const index = async function (req: Request, res: Response) {
    var data = req.body;
    var token = await TokenModel.findOne({ wangwang_id: data.nick_name }).exec();
    if (token) {
        data.session = token._doc.access_token;
        console.log(data.session);
        var result = tuijianClient.execute(data.method, data.params, data.session);
        result.then(function (data) {
            res.json(data);
        });
    } else {
        res.json({ token_error: '店铺API未授权' });
    }

};

export { index }
