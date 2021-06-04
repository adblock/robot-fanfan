// 聚石塔域名
import { JushitaConfig } from "../../../config";
import { TuijianApiConfig, ZhitongcheConfig } from '../../../config/api';
import querystring from "querystring";
import axios from "axios";
import { Request, Response} from 'express';
import { TokenModel } from '../../models/token'
import { RedisClient } from '../../../libs/redisClient';

const TOP_AUTH_URL  = 'https://oauth.taobao.com/authorize';
const TOP_TOKEN_URL = 'https://oauth.taobao.com/token';

export { tuijian, zhitongche }
const tuijianData = {
    w1_expires_in: 15794492,
    refresh_token_valid_time: 1638568800000,
    taobao_user_nick: '%E8%B6%85%E7%BA%A7%E5%A5%B3%E7%94%9F%E7%90%B3%E7%90%B3',
    re_expires_in: 15794492,
    expire_time: 1638568800000,
    token_type: 'Bearer',
    access_token: '6201623514b3b7c31b3ccf4370405c7ZZbdfa173bf5565826151499',
    taobao_open_uid: 'AAEt_fdtAJhYjEbRFIkbTVrU',
    w1_valid: 1638568800000,
    refresh_token: '6201923b96476c76f0f6e3a5b3be324ZZ5679865fbaf8fd26151499',
    w2_expires_in: 1800,
    w2_valid: 1622776107798,
    r1_expires_in: 15794492,
    r2_expires_in: 259200,
    r2_valid: 1623033507798,
    r1_valid: 1638568800000,
    taobao_user_id: '26151499',
    expires_in: 15794492
};
// 直通车api接口默认方法
const tuijian = async (req:Request, res:Response)  => {
    const redisClient = new RedisClient();
    redisClient.setCache(1,1);
    // 是否获取token成功
    let isTokenSuccess = false;
    let TokenData = {};
    // 获取code提交的数据
    const getCodeData:{[index:string]:string} = {
        response_type: 'code',
        client_id: TuijianApiConfig.app_key,
        redirect_uri:  `${JushitaConfig.domain}/auth/callback/tuijian`,
    };
    // 构造获取code的url
    const getCodeUrl = `${TOP_AUTH_URL}?${querystring.stringify(getCodeData)}`;

    // 请求token
    if(req.query.hasOwnProperty('code')){
        // 获取token提交的数据
        const getTokenData:{[index:string]:string} = {
            grant_type: 'authorization_code',
            client_id: TuijianApiConfig.app_key,
            client_secret:  TuijianApiConfig.app_secret,
            code: `${req.query.code}`,
            redirect_uri : `${JushitaConfig.domain}/auth/callback/tuijian`,
        };
        try {
            TokenData = await axios.post(TOP_TOKEN_URL,querystring.stringify(getTokenData));
            console.log(TokenData);
            isTokenSuccess = true;
            TokenModel.create(TokenData,function (err:any, docs:any) {
                console.log(err,docs);
            });
        } catch (err) {
            console.error(err.response.data);
        }
    }
    res.render('auth/callback/tuijian',{
        getCodeUrl:getCodeUrl,
        isTokenSuccess:isTokenSuccess,
        TokenData:TokenData,
    });
};
const zhitongche = async (req:Request, res:Response) => {
    // 是否获取token成功
    let isTokenSuccess = false;
    let TokenData = {};
    // 获取code提交的数据
    const getCodeData:{[index:string]:string} = {
        response_type: 'code',
        client_id: ZhitongcheConfig.app_key,
        redirect_uri:  `${JushitaConfig.domain}/auth/callback/zhitongche`,
    };
    // 构造获取code的url
    const getCodeUrl = `${TOP_AUTH_URL}?${querystring.stringify(getCodeData)}`;

    // 请求token
    if(req.query.hasOwnProperty('code')){
        // 获取token提交的数据
        const getTokenData:{[index:string]:string} = {
            grant_type: 'authorization_code',
            client_id: ZhitongcheConfig.app_key,
            client_secret:  ZhitongcheConfig.app_secret,
            code: `${req.query.code}`,
            redirect_uri : `${JushitaConfig.domain}/auth/callback/zhitongche`,
        };
        try {
            TokenData = await axios.post(TOP_TOKEN_URL,querystring.stringify(getTokenData))
            console.log(TokenData);
            isTokenSuccess = true;
            TokenModel.create(TokenData,function (err:any, docs:any) {
                console.log(err,docs);
            });
        } catch (err) {
            console.error(err.response.data);
        }
    }
    res.render('auth/callback/zhitongche',{
        getCodeUrl:getCodeUrl,
        isTokenSuccess:isTokenSuccess,
        TokenData:TokenData,
    });
};


