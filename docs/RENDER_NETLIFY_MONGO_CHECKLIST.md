# Render / Netlify / MongoDB Deployment Checklist

1. Render service env vars
   - Set `MONGODB_URI` to your Mongo Atlas SRV connection string (keep username/password secret).
   - Set `JWT_SECRET` to a strong random secret (32+ chars).
   - (Optional) Set `PORT` if you want a custom port; default is 5000.
   - Set `FRONTEND_ORIGIN` to your Netlify app URL (e.g. `https://your-site.netlify.app`).

2. Mongo Atlas network access
   - Ensure your cluster allows connections from Render. Options:
     - Add an IP whitelist entry for Render outbound IPs (if known), OR
     - Temporarily allow access from anywhere (`0.0.0.0/0`) for testing (not recommended for production).
     - Confirm the database user has the correct role and password.

3. Render service settings
   - Build command: `cd backend && npm install` (or as configured in `render.yaml`).
   - Start command: `cd backend && npm start`.
   - Health check path: `/api/health`.
   - Check logs for `MongoDB connection successful` or error messages.

4. Local testing
   - Create `backend/.env` with `MONGODB_URI` and `JWT_SECRET` for local runs.
   - From repo root:
     ```bash
     cd backend
     npm install
     npm run check-mongo
     npm start
     ```
   - Test health: `curl http://localhost:5000/api/health`

5. Frontend (Netlify)
   - Deploy frontend to Netlify and note the site URL.
   - Set `FRONTEND_ORIGIN` in Render to the Netlify site URL.
   - If you need redirects or rewrites for SPA routing, create a `netlify.toml` or `_redirects` file in the frontend project.

6. Troubleshooting
   - If connection fails, inspect Render logs for connection errors (timeout, auth, DNS).
   - Verify Atlas user, password, and database name in the connection string.
   - Try connecting locally from the same network to reproduce network ACL issues.
