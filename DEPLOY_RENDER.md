Render deployment steps for ZYNQ Ride backend

1) Push your repo to GitHub (branch: `main` recommended).

2) In Render dashboard:
   - Create a new "Web Service" and connect your GitHub repo.
   - Render will detect `render.yaml` and create the service automatically; if not, configure manually with:
     - Root: repository
     - Build command: `cd backend && npm install`
     - Start command: `cd backend && npm start`
     - Environment: `Node`
     - Branch: `main`

3) Set the following environment variables in the Render service settings (do NOT commit these to source):
   - `MONGODB_URI` = `mongodb+srv://allenjasonnedtec_db_user:<db_password>@zynqride-cluster.4usdlji.mongodb.net/zynqride?retryWrites=true&w=majority`
   - `JWT_SECRET` = a strong secret (e.g. 32+ random chars)
   - `PORT` = 5000 (optional; server defaults to 5000)
   - `FRONTEND_ORIGIN` = https://<your-frontend>.netlify.app

4) Health check and logs:
   - Set the Health Check path to `/api/health`.
   - Use Render's Logs panel to view deploy/build output and runtime errors.

5) After the service is live:
   - Copy the HTTPS service URL (e.g. `https://zynq-ride-backend.onrender.com`).
   - Update frontend API base URL meta tag in `index.html` to that value, or set it dynamically in your hosting.

Local testing commands (run from repo root):

# Install backend deps
cd backend
npm install

# Start locally with env file (create backend/.env with MONGODB_URI and JWT_SECRET)
node server.js

# Check health (example using Node):
"C:\\Program Files\\nodejs\\node.exe" -e "const http=require('http'); const req=http.get('http://localhost:5000/api/health', res=>{ let d=''; res.on('data',c=>d+=c); res.on('end',()=>console.log(res.statusCode,d)); }); req.on('error',e=>console.error('ERR',e.message));"

Notes:
- If Mongo Atlas blocks connections, ensure your cluster allows connections from Render (either via public access or IP white-listing Render's outbound addresses). Using a username/password SRV connection string usually works when the host can reach Internet.
- Keep secrets out of git; set them only in Render's env.

If you want, I can:
- Prepare a GitHub Actions workflow to auto-deploy to Render on push, or
- Walk through connecting the repo and setting the env vars in the Render UI step-by-step.
