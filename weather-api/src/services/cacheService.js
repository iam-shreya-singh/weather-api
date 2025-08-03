const redisConfig = require('../config/redisConfig');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.defaultExpiration = parseInt(process.env.CACHE_EXPIRATION) || 43200;
  }

  async get(key) {
    try {
      const data = await redisConfig.getAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, expiration = this.defaultExpiration) {
    try {
      await redisConfig.setExAsync(key, expiration, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await redisConfig.delAsync(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  generateKey(prefix, params) {
    return `${prefix}:${JSON.stringify(params)}`;
  }
}

module.exports = new CacheService();