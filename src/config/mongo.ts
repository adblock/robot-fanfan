import { env } from '../env/env'
const MongoConfig = {
    url : '',
    host: 'mongo_host' in env ? env.mongo_host : 'localhost',
    port: 'mongo_port' in env ? env.mongo_port : '27017',
    database: 'mongo_database' in env ? env.mongo_database : 'fanfan',
    username: 'mongo_username' in env ? env.mongo_username : null,
    password: 'mongo_password' in env ? env.mongo_password : null,
    auth_database: 'mongo_auth_database' in env ? env.mongo_auth_database : 'admin',
};

MongoConfig.url = `mongodb://${MongoConfig.host}:${MongoConfig.port}/${MongoConfig.database}`;
if(MongoConfig.username !== null){
    MongoConfig.url =`mongodb://${MongoConfig.username}@${MongoConfig.host}:${MongoConfig.port}/${MongoConfig.database}`;
}
if(MongoConfig.password !== null){
    MongoConfig.url =`mongodb://${MongoConfig.username}:${MongoConfig.password}@${MongoConfig.host}:${MongoConfig.port}/${MongoConfig.database}?authMechanism=SCRAM-SHA-1&authSource=${MongoConfig.auth_database}`;
}

export {MongoConfig};
