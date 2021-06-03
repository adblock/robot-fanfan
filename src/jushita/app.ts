import express from 'express';
import { JushitaConfig } from '../config';
import { router } from './routes/router';
import { MongoConfig } from '../config/mongo';
import mongoose from 'mongoose';
import path from 'path';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.resolve( __dirname, 'views') );
app.use('/', router);

mongoose.connect(MongoConfig.url, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection
    .on('error', console.error.bind(console, 'connection error:'))
    .once('open', function() {
        console.log('open')
    });
app.listen(JushitaConfig.listen_port,JushitaConfig.listen_ip,function () {
    console.log(JushitaConfig.listen_ip,JushitaConfig.listen_port);
});
