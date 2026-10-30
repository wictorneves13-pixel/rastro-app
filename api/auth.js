const { readBody } = require('../lib/util');
const { checkPassword, setSession, clearSession, isAdmin } = require('../lib/auth');

// POST /api/auth?action=login  { password }
// POST /api/auth?action=logout
// GET  /api/auth               → { ok: true|false }
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const action = req.query.action;

  if (req.method === 'GET') return res.status(200).json({ ok: isAdmin(req) });
  if (req.method !== 'POST') return res.status(405).json({ error: 'use POST' });

  if (action === 'logout') {
    clearSession(res);
    return res.status(200).json({ ok: true });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Defina ADMIN_PASSWORD nas variáveis de ambiente da Vercel.' });
  }
  const { password } = readBody(req);
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 700)); // atrapalha tentativas em massa
    return res.status(401).json({ error: 'Senha incorreta.' });
  }
  setSession(res);
  return res.status(200).json({ ok: true });
};
