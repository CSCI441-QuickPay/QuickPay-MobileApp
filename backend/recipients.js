// Simple recipient lookup route for local dev / smoke tests.
// Place this file at backend/recipients.js and then require it from your main backend/server.js:
//   const recipientsRouter = require('./recipients');
//   app.use('/api/recipients', recipientsRouter);

const express = require('express');
const router = express.Router();

/**
 * normalizeRow -> guarantee the API returns camelCase fields the app expects
 * Accepts DB rows or other shapes and returns a consistent Recipient object.
 */
function normalizeRow(row) {
  if (!row) return null;
  return {
    accountNumber: row.accountNumber ?? row.account_number ?? row.account ?? null,
    firstName: row.firstName ?? row.first_name ?? row.first ?? '',
    lastName: row.lastName ?? row.last_name ?? row.last ?? '',
    email: row.email ?? '',
    profilePicture: row.profilePicture ?? row.avatar_url ?? row.profile_picture ?? null,
  };
}

/**
 * GET /api/recipients/:phone
 * - For local dev we return a mock for "5502494860"
 * - Otherwise returns 404
 */
router.get('/:phone', async (req, res) => {
  try {
    const phone = String(req.params.phone || '').trim();
    if (!phone) return res.status(400).json({ error: 'phone required' });

    // Quick mock for local testing
    if (phone === '5502494860' || phone.endsWith('5502494860')) {
      const mock = {
        accountNumber: '5502494860',
        firstName: 'Test',
        lastName: 'Recipient',
        email: 'test.recipient@example.com',
        profilePicture: null,
      };
      return res.json({ recipient: normalizeRow(mock) });
    }

    // If you have a DB or model function, call it here instead:
    // const row = await UsersModel.findByAccountOrPhone(phone);
    // const recipient = normalizeRow(row);
    // if (!recipient) return res.status(404).json({ message: 'Recipient not found' });
    // return res.json({ recipient });

    return res.status(404).json({ message: 'Recipient not found' });
  } catch (err) {
    console.error('Error in /api/recipients/:phone', err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;