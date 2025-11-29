const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// OAuth configuration
const GOOGLE_CLIENT_ID = '50708049304-633chc5ijbrsc8u5v05f5qntot8objas.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'YOUR_CLIENT_SECRET'; // Replace with your actual client secret
const NGROK_URL = 'https://aa93d8e8668a.ngrok-free.app';
const REDIRECT_URI = `${NGROK_URL}/auth/callback`;

// Start OAuth flow
app.get('/auth/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar',
    access_type: 'offline',
    prompt: 'consent',
  });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(authUrl);
});

// Handle OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    const { access_token, refresh_token } = tokenResponse.data;
    
    // Return success page with token
    res.send(`
      <html>
        <body>
          <h1>Authentication Successful!</h1>
          <p>You can close this window.</p>
          <script>
            // Post message to parent window (mobile app)
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                access_token: '${access_token}',
                refresh_token: '${refresh_token}'
              }, '*');
              window.close();
            }
            
            // For mobile apps, redirect to custom scheme
            setTimeout(() => {
              window.location.href = 'seamless://oauth?access_token=${access_token}&redirect_uri=https://aa93d8e8668a.ngrok-free.app/auth/callback';
            }, 1000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`OAuth server running on http://localhost:${PORT}`);
});
