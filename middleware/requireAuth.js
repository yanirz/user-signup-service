const session = require('../lib/session');

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const user = header.startsWith('Bearer ') ? session.verify(header.slice(7)) : null;
  if (!user) return res.status(401).json({ error: 'Sign in first' });
  req.user = user;
  next();
};
