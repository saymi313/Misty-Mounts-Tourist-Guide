require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
for (const folder of ['AdminBackend/models', 'LocalGuidePannel/models', 'UserBackend/models', 'models']) {
  for (const file of readdirSync(join(__dirname, '..', folder))) {
    if (file.endsWith('.js')) require(join(__dirname, '..', folder, file));
  }
}
const models = Object.values(mongoose.models);
(async () => {
  try {
    await require('../config/db')();
    // Add declared indexes only. Never drop existing production indexes.
    for (const model of models) { await model.createIndexes(); console.log(`Indexes created: ${model.modelName}`); }
  } finally { await mongoose.disconnect(); }
})().catch(() => { console.error('Index creation failed; inspect database permissions and existing indexes.'); process.exitCode = 1; });
