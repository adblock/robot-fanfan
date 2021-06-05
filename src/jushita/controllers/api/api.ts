// api接口默认方法
import { Request, Response, NextFunction} from 'express';
const index = function (req:Request, res:Response,next:NextFunction) {
    const data = req.body;
    if(data.hasOwnProperty('nick_name') && data.hasOwnProperty('method') && data.hasOwnProperty('params')){
        data.method = 'taobao.httpdns.get';
        next();
    }else {
        res.status(500).json({error:'no nick_name,method,params'});
    }
};

export  { index }
