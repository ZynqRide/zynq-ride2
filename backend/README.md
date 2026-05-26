# ZYNQ Ride - Backend

This folder contains the Express + MongoDB backend for ZYNQ Ride (authentication, users, trips).

Quick start
1. Install dependencies

```bash
cd backend
npm install
```

2. Create a `.env` file (copy from `.env.example`) and set values:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/zynqride?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret_here
OWNER_USERNAME=owner
OWNER_PASSWORD=ChooseOwnerPassword123!
OWNER_EMAIL=owner@zynqride.com
PORT=5000
```

3. Run in development mode

```bash
npm run dev
# or for production
npm start
```

Health check

```bash
curl http://localhost:5000/api/health
# Response: { "status": "ok", "database": "connected" } (or "unavailable" if MONGODB_URI is not set/connected)
```

Register and login examples

Register (rider):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role":"rider",
    "username":"+27841234567",
    "password":"secretPass123",
    "fullName":"Test Rider",
    "email":"rider@example.com",
    "phone":"+27841234567"
  }'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"+27841234567","password":"secretPass123"}'
# Response contains { token, user }
```

Notes
- If `MONGODB_URI` is not set the server will still start, but register/login will return 503 (database unavailable).
- `OWNER_USERNAME` / `OWNER_PASSWORD` will be seeded on first DB connect if provided in `.env`.
- The frontend expects the API base URL in `index.html` via `<meta name="zynq-api-base-url" content="http://localhost:5000">`.
- CORS is limited to `FRONTEND_ORIGIN` and localhost during development; set `FRONTEND_ORIGIN` env var if needed.

Troubleshooting
- MongoDB connection errors: verify Atlas IP whitelist, credentials and `MONGODB_URI` format.
- Duplicate key on register: use a different username/email or remove conflicting document in the `users` collection.

Next steps
- Wire frontend login/register to the API and test flows (use the example `curl` commands above).
- After successful login, open the SPA and confirm `applyUserProfile()` updates the UI with returned user data.

If you'd like, I can run the frontend wiring and test steps next.
