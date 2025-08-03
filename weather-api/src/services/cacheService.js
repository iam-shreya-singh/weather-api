const redisConfig = require('../config/redisConfig');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.defaultExpiration = parseInt(process.env.CACHE_EXPIRATION) || 43200;
    this.redisAvailable = false;
  }

  async checkRedisConnection() {
    try {
      this.redisAvailable = await redisConfig.connect();
      return this.redisAvailable;
    } catch (error) {
      logger.error('Redis connection check failed:', error);
      this.redisAvailable = false;
      return false;
    }
  }

  async get(key) {
    if (!this.redisAvailable) {
      logger.info('Redis not available, skipping cache get');
      return null;
    }
    
    try {
      const data = await redisConfig.get(key);
      return data;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, expiration = this.defaultExpiration) {
    if (!this.redisAvailable) {
      logger.info('Redis not available, skipping cache set');
      return false;
    }
    
    try {
      return await redisConfig.set(key, value, expiration);
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.redisAvailable) {
      logger.info('Redis not available, skipping cache delete');
      return false;
    }
    
    try {
      return await redisConfig.del(key);
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