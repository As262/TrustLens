# 🚀 TrustLens - Quick Start Guide

## One-Minute Setup

### Prerequisites
- Node.js 16+
- MongoDB running locally OR MongoDB Atlas connection string

### Installation (4 steps)

**Step 1:** Install all dependencies
```bash
npm install
npm install --workspace=server
npm install --workspace=client
```

**Step 2:** Create .env file
```bash
cp .env.example .env
# Edit .env and add your MongoDB URI
```

**Step 3:** Seed database with demo data
```bash
npm run seed --workspace=server
```
This creates a demo user with sample transactions!

**Step 4:** Start in two terminals

Terminal 1 (Backend):
```bash
npm run dev --workspace=server
```
✅ Backend running on http://localhost:5000

Terminal 2 (Frontend):
```bash
npm run dev --workspace=client
```
✅ Frontend running on http://localhost:5173

### 🎉 Done! Open http://localhost:5173

---

## Try It Out

1. **Submit a Transaction:**
   - Amount: Try $1500 (high risk)
   - Location: Try "Tokyo" (unusual)
   - Device: Select "Unknown Device"
   - Watch the fraud detection magic! 🚨

2. **Check Trust Score:**
   - See it update in real-time
   - Click transactions to see explanations

3. **View Explanations:**
   - Understand *why* transactions are flagged
   - See risk factors breakdown
   - Learn how AI decides

---

## Troubleshooting

**"Cannot connect to MongoDB"**
- Make sure MongoDB is running
- Check MONGODB_URI in .env
- Use MongoDB Atlas if local doesn't work

**"Port 5000/5173 in use"**
- Kill process: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in .env

**"Module not found"**
- Run `npm install --workspace=server`
- Run `npm install --workspace=client`
- Delete node_modules and reinstall

---

## File Structure

```
d:\TrustLens\
├── client/          # Frontend (React)
├── server/          # Backend (Express)
├── .env.example     # Environment template
├── package.json     # Workspace config
└── README.md        # Full documentation
```

---

## Key Files to Understand

### Backend Logic
- `server/models/` → Database schemas
- `server/services/` → Fraud detection & trust score logic
- `server/controllers/` → API handlers
- `server/server.js` → Express server entry

### Frontend UI
- `client/components/` → Claymorphism UI components
- `client/services/` → API & WebSocket integration
- `client/App.jsx` → Main dashboard

---

## Next Steps

1. ✅ Get it running locally
2. 📝 Read the full README.md for architecture details
3. 🏗️ Explore the code structure
4. 🚀 Deploy to Render/Vercel
5. 🎁 Add your own features!

---

## API Examples

### Submit Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "607f1f77bcf86cd799439011",
    "amount": 500,
    "location": "New York",
    "deviceId": "iphone-14",
    "deviceName": "iPhone 14",
    "category": "shopping"
  }'
```

### Get Trust Score
```bash
curl http://localhost:5000/api/transactions/trust-score/607f1f77bcf86cd799439011
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

---

**Questions?** Check the full README.md or the code comments!

Happy hacking! 🎉
