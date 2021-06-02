import express from 'express';
import cors from "cors";
const  router = express.Router();

// TOP api controllers
import  * as API from '../controllers/api/api';
import  * as APIZhitongche from '../controllers/api/zhitongche';
import  * as APITuijian from '../controllers/api/tuijian';
// 商家认证 controllers
import  * as AuthCallback from '../controllers/auth/callback';

// 处理json与跨域
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors());// 处理跨域
// TOP api 请求
router.use('/api', API.index);
router.post('/api/zhitongche', APIZhitongche.index);
router.post('/api/tuijian', APITuijian.index);
// 商家授权
router.post('/auth/callback/zhitongche', AuthCallback.zhitongche);
router.post('/auth/callback/tuijian', AuthCallback.tuijian);

export { router };
