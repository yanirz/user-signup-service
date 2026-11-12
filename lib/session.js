const crypto = require('crypto');

const SECRET = process.env.SESSION_SECRET;

function sign(userId) {
  const payload = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + 3600_000 })).toString('base64url');
  const mac = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

function verify(token) {
  const [payload, mac] = String(token).split('.');
  if (!payload || !mac) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return session.exp > Date.now() ? { id: session.id } : null;
}

module.exports = { sign, verify };
