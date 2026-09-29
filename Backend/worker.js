require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { enabled, processOne } = require('./utils/deliveryJobs');
let stopping = false;
let wake;
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => { stopping = true; wake?.(); });
async function main() {
  if (!enabled()) throw new Error('Set BACKGROUND_JOBS_ENABLED=true before starting the worker.');
  await connectDB();
  console.log('Delivery worker ready');
  while (!stopping) {
    try { if (await processOne()) continue; }
    catch { console.error('Delivery worker database operation failed; retrying.'); }
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 2000);
      wake = () => { clearTimeout(timer); resolve(); };
      if (stopping) wake();
    });
  }
}
main().catch(() => { console.error('Delivery worker startup failed; check configuration.'); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
