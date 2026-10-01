const { execSync } = require('child_process');
const app = require('./app');

const PORT = parseInt(process.env.PORT, 10) || 5000;

// ─── Proactively free the port before starting ────────────────────────────────
function freePort(port) {
  try {
    const out = execSync('netstat -ano', { encoding: 'utf8' });
    const pids = [...new Set(
      out.split('\n')
        .filter(l => l.includes(`:${port} `) && l.includes('LISTENING'))
        .map(l => l.trim().split(/\s+/).pop())
        .filter(pid => pid && pid !== '0')
    )];
    if (pids.length > 0) {
      pids.forEach(pid => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          console.log(`🔫 Freed port ${port} (killed PID ${pid})`);
        } catch { /* already gone */ }
      });
      // Give OS time to release the port
      execSync('ping 127.0.0.1 -n 2 > nul', { stdio: 'ignore' });
    }
  } catch { /* netstat not available, skip */ }
}

// Clear port BEFORE listen — prevents EADDRINUSE entirely
freePort(PORT);

// ─── Start server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`🚀 AgriSmart API running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ─── Fallback error handler ───────────────────────────────────────────────────
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} still in use after cleanup. Kill all node processes and retry.`);
    console.error(`   Run: taskkill /F /IM node.exe`);
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});

// ─── Graceful shutdown — prevents zombie processes ────────────────────────────
function shutdown(signal) {
  console.log(`\n🛑 ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));




