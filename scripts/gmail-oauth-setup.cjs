/**
 * One-time Gmail OAuth setup for Render (HTTPS Gmail API — bypasses SMTP block).
 *
 * Prerequisites:
 * 1. Google Cloud Console → create OAuth 2.0 Client ID (Desktop app or Web)
 * 2. Enable Gmail API for the project
 * 3. OAuth consent screen: add your Google account as test user (External/Testing)
 * 4. Scopes needed: https://www.googleapis.com/auth/gmail.send
 *
 * Usage:
 *   set GMAIL_CLIENT_ID=...
 *   set GMAIL_CLIENT_SECRET=...
 *   node scripts/gmail-oauth-setup.cjs
 *
 * Paste the printed GMAIL_REFRESH_TOKEN into Render env with:
 *   EMAIL_PROVIDER=gmail_api
 *   GMAIL_USER=kingfisherwingserp@gmail.com
 *   GMAIL_CLIENT_ID=...
 *   GMAIL_CLIENT_SECRET=...
 *   GMAIL_REFRESH_TOKEN=...
 *   SMTP_FROM_NAME=KingFisher Wings
 *   SMTP_FROM_EMAIL=kingfisherwingserp@gmail.com
 */
const http = require("http");
const { URL } = require("url");
const { exec } = require("child_process");

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const PORT = Number(process.env.GMAIL_OAUTH_PORT || 53682);
const REDIRECT = `http://127.0.0.1:${PORT}/oauth2callback`;
const SCOPE = encodeURIComponent("https://www.googleapis.com/auth/gmail.send");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET first.");
  process.exit(1);
}

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT)}` +
  `&response_type=code` +
  `&scope=${SCOPE}` +
  `&access_type=offline` +
  `&prompt=consent`;

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if (u.pathname !== "/oauth2callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const code = u.searchParams.get("code");
    if (!code) {
      res.writeHead(400);
      res.end("Missing code");
      return;
    }

    const body = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT,
      grant_type: "authorization_code",
    }).toString();

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = await tokenRes.json();
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    if (!json.refresh_token) {
      res.end(
        `<pre>No refresh_token returned. Revoke app access at https://myaccount.google.com/permissions and retry with prompt=consent.\n\n${JSON.stringify(json, null, 2)}</pre>`,
      );
      console.error("No refresh_token:", json);
      server.close();
      return;
    }

    console.log("\n=== Add these to Render Environment ===\n");
    console.log("EMAIL_PROVIDER=gmail_api");
    console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GMAIL_REFRESH_TOKEN=${json.refresh_token}`);
    console.log("GMAIL_USER=kingfisherwingserp@gmail.com");
    console.log("\n=======================================\n");

    res.end(
      "<h1>Gmail OAuth OK</h1><p>Refresh token printed in the terminal. You can close this tab.</p>",
    );
    server.close();
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end(String(err));
    server.close();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Listening on ${REDIRECT}`);
  console.log("Opening browser for Google consent…");
  console.log(authUrl);
  const cmd =
    process.platform === "win32"
      ? `start "" "${authUrl}"`
      : process.platform === "darwin"
        ? `open "${authUrl}"`
        : `xdg-open "${authUrl}"`;
  exec(cmd);
});
