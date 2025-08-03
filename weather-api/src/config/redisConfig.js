const redis = require('redis');

class RedisConfig {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
  }

  async connect() {
    try {
      // Create Redis client with retry logic
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > this.maxConnectionAttempts) {
              console.log('Max Redis connection attempts reached, giving up');
              return new Error('Max connection attempts reached');
            }
            return Math.min(retries * 100, 3000); // Exponential backoff
          }
        }
      });

      // Set up event listeners
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Disconnected from Redis');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
      
      // Set memory-efficient options
      await this.client.configSet('maxmemory', '256mb');
      await this.client.configSet('maxmemory-policy', 'allkeys-lru');
      console.log('Redis configured with memory limits');
      
      return true;
    } catch (error) {
      console.error('Redis connection error:', error);
      console.log('Continuing without Redis caching...');
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
      } catch (error) {
        console.error('Redis disconnect error:', error);
      }
    }
  }

  // ... rest of the methods remain the same
  async get(key) {
    if (!this.isConnected || !this.client) return null;
    
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, expiration = 43200) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.setEx(key, expiration, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  generateKey(prefix, params) {
    return `${prefix}:${JSON.stringify(params)}`;
  }
}

module.exports = new RedisConfig();