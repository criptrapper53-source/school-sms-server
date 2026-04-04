const express = require('express');
const cors = require('cors');
const AfricasTalking = require('africastalking');

const app = express();
app.use(cors());
app.use(express.json());

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

app.post('/send-sms', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'Missing phone or message' });
  try {
    const result = await at.SMS.send({
      to: [phone],
      message: message,
      from: process.env.AT_SENDER_ID || ''
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => res.send('School SMS Server is running ✓'));

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
