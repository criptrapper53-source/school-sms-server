# EDU360 SMS Proxy Server

A minimal server that sits between `edu360.html` (the browser) and Africa's Talking's SMS API.
It exists so your Africa's Talking API key never has to live in the browser-facing HTML file.

## What it does
- Exposes one endpoint: `POST /send-sms` with JSON body `{ "phone": "+2335...", "message": "..." }`
- Forwards that to Africa's Talking's `messaging` endpoint using your API key + username (kept as environment variables, never in code)
- Returns `{ "success": true/false }` back to the browser — same shape the old server used, so `edu360.html` doesn't need to change how it reads the response

## Deploy to Render (new service)

1. Go to https://dashboard.render.com and click **New → Web Service**.
2. If your code is in a GitHub repo, connect it. If not, you can use Render's "Public Git repository" option after pushing this folder to a new GitHub repo (or ask me and I'll walk you through creating one).
3. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment**, add these variables:
   - `AT_API_KEY` = your Africa's Talking API key (the `atsk_...` one)
   - `AT_USERNAME` = `EDU360`
   - `AT_SENDER_ID` = (leave blank unless you've registered a custom alphanumeric sender ID with Africa's Talking)
5. Click **Create Web Service**. Render will build and deploy it — you'll get a URL like `https://your-service-name.onrender.com`.
6. Test it's alive by visiting that URL in a browser — you should see "EDU360 SMS proxy is running."

## Once deployed

Send me the new service URL and I'll update `edu360.html`'s `AT_SMS_SERVER` and `SMS_SERVER_URL` constants to point to it, replacing the old `school-sms-server.onrender.com` references.

## Security note

Never commit your actual API key into this code or into a public GitHub repo. It should only ever exist as an environment variable in Render's dashboard.
