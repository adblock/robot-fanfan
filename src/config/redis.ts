import { env } from '../env/env'

const RedisConfig = {
    host: 'redis_host' in env ? env.redis_host : '171.0.0.1',
    port: 'redis_port' in env ? env.redis_port : 6379,
    password: 'redis_password' in env ? env.redis_password : null,
    db: 'redis_db' in env ? env.redis_db : 0,
}

export {RedisConfig};
