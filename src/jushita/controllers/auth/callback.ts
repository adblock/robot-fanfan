// 聚石塔域名
import { JushitaConfig } from "../../../config";
import { TuijianApiConfig, ZhitongcheConfig } from '../../../config/api';
import querystring from "querystring";
import axios from "axios";
import {Request, Response} from 'express';
import { TokenModel } from '../../models/token'
import * as QueryString from "querystring";

const TOP_AUTH_URL  = 'https://oauth.taobao.com/authorize';
const TOP_TOKEN_URL = 'https://oauth.taobao.com/token';

export { tuijian, zhitongche }

const Config:{[index:string]:any} = {
    'tuijian':TuijianApiConfig,
    'zhitongche':TuijianApiConfig,
};

const callback = async (type:string, code:string) =>{
    const config = Config[type];
    // 是否获取token成功
    let isTokenSuccess = false;
    let tokenResultData = {};
    // 获取code提交的数据
    const getCodeData = {
        response_type: 'code',
        client_id: config.app_key,
        redirect_uri:  `${JushitaConfig.domain}/auth/callback/${type}`,
    };
    // 构造获取code的url
    const getCodeUrl = `${TOP_AUTH_URL}?${querystring.stringify(getCodeData)}`;
    if(code !== ''){
        // 请求token
        // 获取token提交的数据
        const getTokenData = {
            grant_type: 'authorization_code',
            client_id: config.app_key,
            client_secret:  config.app_secret,
            code: code,
            redirect_uri : `${JushitaConfig.domain}/auth/callback/${type}`,
        };
        try {
            const tokenData = await axios.post(TOP_TOKEN_URL,querystring.stringify(getTokenData));
            if(tokenData.status === 200 && tokenData.data.hasOwnProperty('access_token')){
                // 写入一些属性
                tokenData.data.client_id = config.app_key;
                tokenData.data.wangwang_id = decodeURIComponent(tokenData.data.taobao_user_nick);
                const result = await TokenModel.create(tokenData.data);
                if(result){
                    tokenResultData = tokenData.data;
                    isTokenSuccess = true;
                }
            }
        } catch (err) {
            console.error(err.response.data);
        }
    }
    return {
        getCodeUrl:getCodeUrl,
        isTokenSuccess:isTokenSuccess,
        tokenResultData:tokenResultData,
    }
};

// 超级推荐获取授权
const tuijian = async (req:Request, res:Response)  => {
    let code = '';
    if(req.query.hasOwnProperty('code') && req.query.code !== undefined){
        code = req.query.code.toString();
    }
    const renderData = await callback('tuijian', code);
    res.render('auth/callback/tuijian',renderData);
};

// 直通车获取授权
const zhitongche = async (req:Request, res:Response) => {
    let code = '';
    if(req.query.hasOwnProperty('code') && req.query.code !== undefined){
        code = req.query.code.toString();
    }
    const renderData = await callback('zhitongche', code);
    res.render('auth/callback/zhitongche',renderData);
};


