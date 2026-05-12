const { Redis } = require('ioredis');
const MockRedis = require('ioredis-mock');

let redis;

if (process.env.NODE_ENV === 'test') {
  // Use an in-memory mock for tests to avoid touching production Redis
  redis = new MockRedis();
} else {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  });

  redis.on('connect', () => {
    console.log('Connected to redis');
  });
}

module.exports = redis;
