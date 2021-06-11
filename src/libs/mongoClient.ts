/*
@File     ：mongoClient.py
@Author   ：qingyang
@Date     ：2021/6/8 14:35
@describe ：mongo的客户端类
*/
import { MongoConfig } from "../config/mongo";
import mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;

class Client {
    public client:mongodb.MongoClient | undefined;
    public database: any | null;
    public connected = false;

    constructor() {
        console.log('constructor');
    }

    async getDB(databaseName:string=MongoConfig.database){
        if(!this.connected) {
            this.client = await MongoClient.connect(MongoConfig.url, {useUnifiedTopology:true});
            this.database = this.client.db(databaseName);
            this.connected = true;
            return this.database;
        }
        if(this.client !== undefined && this.connected) {
            this.database = this.client.db(databaseName);
            return this.database;
        }
    };

    async mongoClose(){
        if(this.client){
            await this.client.close();
        }
    };
}
const mongoClient = new Client();
export { mongoClient };
