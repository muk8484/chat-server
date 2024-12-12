// 환경 설정 상수
const Environments = {
    DEV: 'dev',
    PROD: 'prod',
    STAGE: 'stage'
  };
  
/**
 * 기본 설정 클래스
 */
class Setting {
    constructor(config = {}) {
        Object.assign(this, config);
    }
}

/**
 * 웹 서버 설정
 */
class WebServerSetting extends Setting {
    constructor(config = {}) {
        super();
        this.host = config.host || '0.0.0.0';
        this.port = config.port || 8000;
        this.debug = config.debug ?? true;
        this.reload = config.reload ?? true;
        this.workers = config.workers || 1;
        this.log_level = config.log_level || 'trace';
    }
}

/**
 * Redis 설정
 */
class RedisSetting extends Setting {
    constructor(config = {}) {
        super();
        this.host = config.host || 'localhost';
        this.port = config.port || 6379;
        this.db = config.db || 0;
        this.base_key = config.base_key || 'localhost';
        this.lock_expire_time = config.lock_expire_time || 60;
    }
}

/**
 * MongoDB 설정
 */
class MongoSetting extends Setting {
    constructor(config = {}) {
        super();
        this.url = config.url || 'mongodb://rootuser:rootpassword@localhost:27017';
        this.db = config.db || 'ai_microservice';
        this.result_logs_collection = config.result_logs_collection || 'result_logs';
        this.error_logs_collection = config.error_logs_collection || 'error_logs';
    }
}

/**
 * 기본 환경 설정 클래스
 */
// class DotEnvSettings {
//     constructor(config = {}) {
//         this.env = config.env || process.env.ENV || Environments.DEV;
//         this.service_name = config.service_name || null;
        
//         this._process_env_file(config);
//     }

//     _process_env_file(config) {
//         let env_file = config._env_file || `.${this.env}.env`;
        
//         if (config._prefix) {
//         env_file = env_file.startsWith('.') 
//             ? `${config._prefix}${env_file}`
//             : `${config._prefix}.${env_file}`;
//         }
//     }
// }
class DotEnvSettings {
    constructor(config = {}) {
        this.env = config.env || process.env.ENV || Environments.DEV;
        this.service_name = config.service_name || null;
        
        this._process_env_file(config);
    }

    _process_env_file(config) {
        let env_file = config._env_file || `.${this.env}.env`;
        
        if (config._prefix) {
            env_file = env_file.startsWith('.') 
                ? `${config._prefix}${env_file}`
                : `${config._prefix}.${env_file}`;
        }
    }
}
/**
 * 데이터베이스 설정
 */
class DatabaseSettings extends DotEnvSettings {
    constructor(config = {}) {
        super(config);
        this.redis = new RedisSetting(config.redis);
        this.mongo = new MongoSetting(config.mongo);
    }
}
  
module.exports = {
    Environments,
    WebServerSetting,
    RedisSetting,
    MongoSetting,
    DatabaseSettings,
};