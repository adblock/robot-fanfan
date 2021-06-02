import express from 'express';
import { JushitaConfig } from '../config';
import { router } from './routes/router'

const app = express();
app.use('/', router);

app.listen(JushitaConfig.listen_port,JushitaConfig.listen_ip,function () {
    console.log(JushitaConfig.listen_ip,JushitaConfig.listen_port);
});
