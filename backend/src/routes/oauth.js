import { Router } from 'express';
import axios from 'axios';
import { saveOAuthToken, hasAnyOAuthToken } from '../store/index.js';

const router = Router();

// GET /oauth/initiate
// Redirects the user to HighLevel's OAuth consent page
router.get('/initiate', (req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.HL_CLIENT_ID,
    redirect_uri: process.env.HL_REDIRECT_URI,
    scope: process.env.HL_SCOPES,
  });
  const url = `https://marketplace.gohighlevel.com/oauth/chooselocation?${params}`;
  res.redirect(url);
});

// GET /oauth/callback
// Receives the auth code from HL, exchanges it for an access token, stores it
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    const response = await axios.post(
      'https://services.leadconnectorhq.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.HL_CLIENT_ID,
        client_secret: process.env.HL_CLIENT_SECRET,
        redirect_uri: process.env.HL_REDIRECT_URI,
        code,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, locationId } = response.data;
    saveOAuthToken(locationId, access_token);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Voice AI Copilot — Connected</title>
          <style>
            body { font-family: Inter, system-ui, sans-serif; display: flex; align-items: center;
                   justify-content: center; height: 100vh; margin: 0; background: #f8f9fc; }
            .card { background: white; border-radius: 12px; padding: 40px 48px; text-align: center;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            h2 { color: #0f3460; margin: 0 0 8px; }
            p  { color: #6b7280; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>✓ Voice AI Copilot connected successfully.</h2>
            <p>You can close this tab and return to HighLevel.</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('OAuth failed: ' + err.message);
  }
});

// GET /oauth/status
// Returns { connected: true/false } — frontend can poll this to show connection state
router.get('/status', (req, res) => {
  res.json({ connected: hasAnyOAuthToken() });
});

export default router;
