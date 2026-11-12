const fs = require('fs');
const path = require('path');

const EXPORT_DIR = path.resolve(process.env.EXPORT_DIR || './exports');

function exportToFile(name, data) {
  const safeName = path.basename(String(name)).replace(/[^a-zA-Z0-9._-]/g, '_');
  const target = path.join(EXPORT_DIR, `${safeName}.json`);
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.writeFileSync(target, JSON.stringify(data));
  return target;
}

module.exports = { exportToFile };
