/**
 * 获取授权token的控制器
 *
 * **/
import { JushitaConfig } from "../../../config";
import { TuijianApiConfig, ZhitongcheConfig } from '../../../config/api';
import querystring from "querystring";
import axios from "axios";
import {Request, Response} from 'express';
import { TokenModel } from '../../models/token';
const TOP_AUTH_URL  = 'https://oauth.taobao.com/authorize';
const TOP_TOKEN_URL = 'https://oauth.taobao.com/token';
const GLOBAL_CONFIG:{[index:string]:any} = {
    'tuijian':TuijianApiConfig,
    'zhitongche':ZhitongcheConfig,
};

/**
 * 获取token的公用方法
 * @params type string 产品类型 tuijian 超级推荐 zhitongche 直通车
 * @params code string 获取token的code
 * @return {
        getCodeUrl:string,
        isTokenSuccess:bool,
        tokenResultData:object,
    }
 * **/
const callback = async (type:string, code:string) =>{
    const config = GLOBAL_CONFIG[type];
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
            console.error(err);
        }
    }
    return {
        getCodeUrl:getCodeUrl,
        isTokenSuccess:isTokenSuccess,
        tokenResultData:tokenResultData,
    }
};

/**
 * 授权回调的超级推荐的控制器方法
 * @params req Request express http对象
 * @params res Response express http对象
 * @return void
 * **/
const tuijian = async (req:Request, res:Response)  => {
    let code = '';
    if(req.query.hasOwnProperty('code') && req.query.code !== undefined){
        code = req.query.code.toString();
    }
    const renderData = await callback('tuijian', code);
    res.render('auth/callback/tuijian',renderData);
};

/**
 * 授权回调的直通车的控制器方法
 * @params req Request express http对象
 * @params res Response express http对象
 * @return void
 * **/
const zhitongche = async (req:Request, res:Response) => {
    let code = '';
    if(req.query.hasOwnProperty('code') && req.query.code !== undefined){
        code = req.query.code.toString();
    }
    const renderData = await callback('zhitongche', code);
    res.render('auth/callback/zhitongche',renderData);
};

export { tuijian, zhitongche }
