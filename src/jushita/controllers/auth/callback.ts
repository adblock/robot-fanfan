// 聚石塔域名
import { JushitaConfig } from "../../../config";
import { TuijianApiConfig, ZhitongcheConfig } from '../../../config/api';
import querystring from "querystring";
import axios from "axios";
import { Request, Response} from 'express';
const TOP_AUTH_URL  = 'https://oauth.taobao.com/authorize';
const TOP_TOKEN_URL = 'https://oauth.taobao.com/token';


// 直通车api接口默认方法
const tuijian = function (req:Request, res:Response) {
    if(req.query.hasOwnProperty('code')){
        const getTokenData:{[index:string]:string} = {
            grant_type: 'authorization_code',
            client_id: TuijianApiConfig.app_key,
            client_secret:  TuijianApiConfig.app_secret,
            code: `${req.query.code}`,
            redirect_uri : `${JushitaConfig.domain}/auth/callback/tuijian`,
        };
        console.log(getTokenData);
        axios.post(TOP_TOKEN_URL,querystring.stringify(getTokenData)).then((data)=>{
            console.log(2);
        }).catch(data=>{
            console.log(1);
        });
    }
    res.render('auth/callback/tuijian');
};
const zhitongche = function (req:Request, res:Response) {
    console.log(zhitongche);
};

export { tuijian, zhitongche }
