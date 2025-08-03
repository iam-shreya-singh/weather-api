const os = require('os');

setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('\n=== Resource Usage ===');
  console.log(`Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
  console.log(`CPU Load: ${os.loadavg().map(load => load.toFixed(2)).join(', ')}`);
  console.log(`Uptime: ${Math.round(process.uptime())}s`);
  console.log('=====================\n');
}, 10000);