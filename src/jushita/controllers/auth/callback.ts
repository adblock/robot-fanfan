// 聚石塔域名
import { JushitaConfig } from "../../../config";
import { TuijianApiConfig, ZhitongcheConfig } from '../../../config/api';
import querystring from "querystring";
import axios from "axios";
import {Request, Response} from 'express';
import { TokenModel } from '../../models/token'

const TOP_AUTH_URL  = 'https://oauth.taobao.com/authorize';
const TOP_TOKEN_URL = 'https://oauth.taobao.com/token';

export { tuijian, zhitongche }
// 超级推荐获取授权
const tuijian = async (req:Request, res:Response)  => {
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
            const tokenData = await axios.post(TOP_TOKEN_URL,querystring.stringify(getTokenData));
            if(tokenData.status === 200 && tokenData.data.hasOwnProperty('access_token')){
                // 写入一些属性
                tokenData.data.client_id = TuijianApiConfig.app_key;
                tokenData.data.wangwang_id = decodeURIComponent(tokenData.data.taobao_user_nick);
                const result = await TokenModel.create(tokenData.data);
                if(result){
                    TokenData = tokenData.data;
                    isTokenSuccess = true;
                }
            }
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

// 直通车获取授权
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
            const tokenData = await axios.post(TOP_TOKEN_URL,querystring.stringify(getTokenData));
            if(tokenData.status === 200 && tokenData.data.hasOwnProperty('access_token')){
                // 写入一些属性
                tokenData.data.client_id = ZhitongcheConfig.app_key;
                tokenData.data.wangwang_id = decodeURIComponent(tokenData.data.taobao_user_nick);
                const result = await TokenModel.create(tokenData.data);
                if(result){
                    TokenData = tokenData.data;
                    isTokenSuccess = true;
                }
            }
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


