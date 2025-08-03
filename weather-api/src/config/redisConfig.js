const redis = require('redis');
const { promisify } = require('util');

class RedisConfig {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    // Promisify Redis methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setExAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  async connect() {
    try {
      await this.client.connect();
      // Set memory-efficient options
      await this.client.configSet('maxmemory', '256mb');
      await this.client.configSet('maxmemory-policy', 'allkeys-lru');
      console.log('Redis configured with memory limits');
    } catch (error) {
      console.error('Redis connection error:', error);
      // Continue without Redis if connection fails
      console.log('Continuing without Redis caching...');
    }
  }

  async disconnect() {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }
}

module.exports = new RedisConfig();