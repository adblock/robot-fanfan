// api接口默认方法
const index = function (req:any, res:any,next:any) {
    const data = req.body;
    if(data.hasOwnProperty('nick_name') && data.hasOwnProperty('method') && data.hasOwnProperty('params')){
        data.method = 'taobao.httpdns.get'
        next();
    }else {
        res.status(500).json({error:'no nick_name,method,params'});
    }
}

export  { index }
