// EDU360 SMS Proxy Server
// Forwards SMS requests from the browser to Africa's Talking,
// keeping the API key safely on the server side.

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---- Africa's Talking credentials (set these in Render's Environment tab, NOT here) ----
const AT_API_KEY = process.env.AT_API_KEY;   // e.g. atsk_502d7b...
const AT_USERNAME = process.env.AT_USERNAME; // e.g. EDU360
const AT_SENDER_ID = process.env.AT_SENDER_ID || ''; // optional, leave blank if none registered

if (!AT_API_KEY || !AT_USERNAME) {
  console.warn('[WARN] AT_API_KEY or AT_USERNAME not set. SMS sending will fail until these env vars are configured.');
}

app.get('/', (req, res) => {
  res.send('EDU360 SMS proxy is running.');
});

app.post('/send-sms', async (req, res) => {
  try {
    const { phone, message } = req.body || {};
    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'phone and message are required' });
    }

    const params = new URLSearchParams();
    params.append('username', AT_USERNAME);
    params.append('to', phone);
    params.append('message', message);
    if (AT_SENDER_ID) params.append('from', AT_SENDER_ID);

    const atRes = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'apiKey': AT_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    const rawText = await atRes.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      // Africa's Talking returned plain text, not JSON — this almost always
      // means an auth/account problem (bad API key, wrong username, etc.)
      console.error('[SMS proxy] Africa\'s Talking returned non-JSON response:', rawText);
      return res.status(502).json({
        success: false,
        error: 'Africa\'s Talking rejected the request: ' + rawText
      });
    }

    // Africa's Talking returns SMSMessageData.Recipients[] with a status per recipient
    const recipients = data && data.SMSMessageData && data.SMSMessageData.Recipients;
    const ok = Array.isArray(recipients) && recipients.length > 0 &&
      recipients[0].status === 'Success';

    if (!ok) {
      console.error('[SMS proxy] Send did not succeed:', JSON.stringify(data));
    }

    return res.json({ success: ok, raw: data });
  } catch (err) {
    console.error('[SMS proxy error]', err);
    return res.status(500).json({ success: false, error: 'server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('SMS proxy listening on port ' + PORT));
