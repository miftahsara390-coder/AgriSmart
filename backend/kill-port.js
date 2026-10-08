/**
 * kill-port.js — Kills any process using port 5000 before starting.
 * Usage: node kill-port.js
 */
import { execSync } from 'child_process';

const PORT = process.env.PORT || 5000;

try {
  const out = execSync('netstat -ano', { encoding: 'utf8' });
  const pids = [...new Set(
    out.split('\n')
      .filter(line => line.includes(`:${PORT} `) && line.includes('LISTENING'))
      .map(line => line.trim().split(/\s+/).pop())
      .filter(pid => pid && pid !== '0')
  )];

  if (pids.length === 0) {
    console.log(`✅ Port ${PORT} is free.`);
  } else {
    pids.forEach(pid => {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`✅ Killed process PID ${pid} on port ${PORT}`);
      } catch {
        console.log(`⚠️  PID ${pid} already gone.`);
      }
    });
  }
} catch (e) {
  console.error('Error checking port:', e.message);
}
