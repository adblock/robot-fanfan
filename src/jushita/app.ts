import express from 'express';
import { JushitaConfig } from '../config';
import { router } from './routes/router'
import path from 'path';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.resolve( __dirname, 'views') );
app.use('/', router);

app.listen(JushitaConfig.listen_port,JushitaConfig.listen_ip,function () {
    console.log(JushitaConfig.listen_ip,JushitaConfig.listen_port);
});
