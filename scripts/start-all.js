const { spawn, spawnSync } = require('child_process');
const path = require('path');

console.log('[Startup] Starting CryptoFD services...\n');

// Seed database before starting services
console.log('[Startup] Seeding database with initial data...');
const seedResult = spawnSync('npx', ['tsx', 'scripts/seed-db.ts'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  timeout: 30000
});

if (seedResult.error) {
  console.warn('[Startup] Database seed warning (continuing):', seedResult.error);
} else if (seedResult.status !== 0) {
  console.warn('[Startup] Database seed exited with status', seedResult.status, '(continuing)');
} else {
  console.log('[Startup] ✓ Database seeded successfully\n');
}

// Start Next.js web server
console.log('[Startup] Starting Next.js web server on port 3000...');
const nextProcess = spawn('next', ['start'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

nextProcess.on('error', (err) => {
  console.error('[Startup] Error starting Next.js:', err);
  process.exit(1);
});

// Wait 3 seconds for Next.js to start, then start backend-worker
setTimeout(() => {
  console.log('\n[Startup] Starting backend worker with FD processor cron jobs...');
  const workerProcess = spawn('npm', ['start'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..', 'backend-worker')
  });

  workerProcess.on('error', (err) => {
    console.error('[Startup] Error starting backend-worker:', err);
    // Don't exit - web app should keep running
  });

  // Handle graceful shutdown
  const shutdown = () => {
    console.log('\n[Startup] Shutting down services gracefully...');
    nextProcess.kill('SIGTERM');
    workerProcess.kill('SIGTERM');
    
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

}, 3000);

// Also handle main process shutdown
process.on('SIGTERM', () => {
  console.log('\n[Startup] Received SIGTERM, shutting down...');
  nextProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n[Startup] Received SIGINT, shutting down...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});
