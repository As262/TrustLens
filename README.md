# 🧠 TrustLens - Explainable AI Layer for Digital Banking

> **Real-time Fraud Detection with Complete Transparency**

A production-ready hackathon project that demonstrates explainable AI in financial technology. TrustLens analyzes every transaction in real-time, flagging suspicious patterns while explaining *why* each decision was made.

## ✨ Features

### 🔍 **Intelligent Fraud Detection**
- **Multi-factor Analysis**: Analyzes amount, location, time, device, and transaction frequency
- **Lightweight AI**: Runs instantly without external ML services
- **Real-time Processing**: Decisions in milliseconds

### 📊 **Trust Score Engine**
- **Dynamic Scoring**: Updates based on user behavior
- **Risk Levels**: Low, Medium, High (color-coded UI)
- **Transparent Breakdown**: See exactly what impacts your score

### 💡 **Explainability Layer** (The Magic!)
- **Human-Readable Reasons**: "Amount is 3x your typical transaction"
- **Risk Factor Detail**: Shows which factors triggered the alert
- **Confidence Metrics**: Displays AI confidence levels

### 🎨 **Modern Claymorphism UI**
- **Soft Shadows**: Neumorphic design aesthetic
- **Pastel Gradients**: Eye-friendly color scheme
- **Smooth Animations**: Delightful interactions
- **Fully Responsive**: Works on mobile, tablet, desktop

### ⚡ **Real-time Updates**
- **Socket.io Integration**: Instant alerts when transactions are flagged
- **Live Dashboard**: See updates as they happen
- **Status Notifications**: Know your account status in real-time

---

## 🏗️ Architecture

```
TrustLens
├── Frontend (React + Vite)
│   └── Claymorphism UI Components
├── Backend (Node.js + Express)
│   ├── Fraud Detection Service
│   ├── Trust Score Service
│   ├── Explainability Engine
│   └── Real-time Socket.io
└── Database (MongoDB)
    ├── Users
    ├── Transactions
    └── Fraud Logs
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v16+ (download from nodejs.org)
- **MongoDB**: Local or MongoDB Atlas connection string
- **npm**: Comes with Node.js

### Installation

1. **Clone & Navigate**
```bash
cd d:\TrustLens
```

2. **Install Dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
npm install --workspace=server

# Install frontend dependencies
npm install --workspace=client
```

3. **Configure Environment**
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your MongoDB connection
# MONGODB_URI=mongodb://localhost:27017/trustlens
# Or use MongoDB Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/trustlens
```

4. **Seed Database** (Create demo data)
```bash
npm run seed --workspace=server
```
This creates:
- Demo user: `demo@trustlens.com`
- 6 sample transactions (mix of normal and flagged)
- Pre-calculated trust scores

5. **Start the Application**

**Terminal 1 - Backend:**
```bash
npm run dev --workspace=server
# Server starts on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev --workspace=client
# App opens at http://localhost:5173
```

6. **Access the Dashboard**
- Open browser to `http://localhost:5173`
- Submit test transactions
- Watch real-time fraud detection in action

---

## 📚 How It Works

### Transaction Flow

```
1. User submits transaction
   ↓
2. Backend receives: amount, location, device, category
   ↓
3. Fraud Detection Service analyzes:
   • Amount anomaly (Z-score based)
   • Location anomaly (new locations)
   • Time anomaly (unusual hours)
   • Device anomaly (new devices)
   • Frequency anomaly (too many txns)
   ↓
4. Explainability Engine generates reasons
   ↓
5. Trust Score updated based on risk
   ↓
6. Frontend displays result with full explanation
   ↓
7. If flagged: Real-time alert via Socket.io
```

### Example Output
```json
{
  "transactionId": "507f1f77bcf86cd799439012",
  "fraudScore": 0.78,
  "isFlagged": true,
  "status": "flagged",
  "summary": {
    "riskLevel": "🔴 High Risk - Transaction Flagged",
    "summary": "Multiple suspicious patterns detected. Manual review recommended."
  },
  "explanations": [
    "🔴 High Transaction Amount: 8.5x your typical transaction ($1500 vs avg $176.23)",
    "📍 Unusual Location: Transaction from \"Tokyo\" - not in your typical locations",
    "📱 New Device: Device \"Unknown Device\" not previously associated with your account",
    "⏰ Unusual Time: Transaction at 3:45 - outside typical activity hours"
  ],
  "trustScore": 72,
  "riskLevel": "medium"
}
```

---

## 🧪 Test Scenarios

### Test 1: Normal Transaction ✅
```
Amount: $50
Location: New York
Device: iPhone 14
Result: Approved (Low fraud score ~0.08)
```

### Test 2: Moderate Anomaly 🟡
```
Amount: $300
Location: San Francisco (not recent)
Device: iPhone 14
Result: Under Review (Medium fraud score ~0.35)
Explanation: Amount 3x normal, unfamiliar location
```

### Test 3: High Risk Transaction 🔴
```
Amount: $1500
Location: Tokyo
Device: Unknown Device
Result: Flagged (High fraud score ~0.78)
Explanations: All anomalies triggered
```

---

## 📊 API Endpoints

### Submit Transaction
```
POST /api/transactions
Body: {
  "userId": "607f1f77bcf86cd799439011",
  "amount": 250.00,
  "location": "New York",
  "deviceId": "iphone-14",
  "deviceName": "iPhone 14",
  "category": "shopping"
}
```

### Get Transaction History
```
GET /api/transactions/user/:userId?limit=20&offset=0
```

### Get Trust Score
```
GET /api/transactions/trust-score/:userId
```

### Get Fraud Analysis
```
GET /api/transactions/fraud-log/:transactionId
```

### Health Check
```
GET /api/health
```

---

## 🎨 UI Components

### TrustScoreCard
- Circular animated score display
- Color-coded risk levels
- Real-time updates

### TransactionList
- Scrollable transaction history
- Status indicators
- Click to view details

### FraudAlertPanel
- Real-time alert notifications
- Risk level badges
- Dismissible design

### ExplanationBox
- Detailed explanation of decisions
- Risk factor breakdown
- AI confidence metrics

### TransactionForm
- Easy transaction submission
- Category selector
- Real-time processing

---

## 🔐 Security Features

- ✅ **JWT Authentication** (ready to implement)
- ✅ **Password Hashing** (bcryptjs)
- ✅ **CORS Protection**
- ✅ **Input Validation** (Joi)
- ✅ **Environment Variables**
- ✅ **Device Fingerprinting**
- ✅ **Rate Limiting**-ready

---

## 🛠️ Tech Stack Details

### Frontend
- **React 18.2** - UI library
- **Vite 4.3** - Build tool (lightning fast)
- **Tailwind CSS 3.3** - Utility-first CSS
- **Lucide React** - Beautiful icons
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express 4.18** - Web framework
- **MongoDB 7.0** - Document database
- **Mongoose** - ODM for MongoDB
- **Socket.io 4.6** - WebSocket library
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Deployment Ready
- ✅ Environment configuration
- ✅ Error handling
- ✅ Logging structure
- ✅ API documentation
- ✅ Database optimization

---

## 📦 Project Structure

```
d:\TrustLens\
├── client/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── TrustScoreCard.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   ├── FraudAlertPanel.jsx
│   │   │   ├── ExplanationBox.jsx
│   │   │   └── TransactionForm.jsx
│   │   ├── services/             # API & Socket services
│   │   │   ├── api.js
│   │   │   └── socketService.js
│   │   ├── styles/               # CSS
│   │   │   └── globals.css
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/
│   ├── models/                   # MongoDB models
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── FraudLog.js
│   ├── controllers/              # Route handlers
│   │   └── transactionController.js
│   ├── services/                 # Business logic
│   │   ├── fraudService.js
│   │   ├── explainabilityService.js
│   │   └── trustScoreService.js
│   ├── routes/                   # API routes
│   │   └── transactions.js
│   ├── utils/                    # Utilities
│   │   └── seed.js               # Database seeding
│   ├── server.js                 # Express server
│   └── package.json
│
├── .env.example                  # Environment template
├── package.json                  # Root workspace config
└── README.md                     # This file
```

---

## 🚀 Deployment

### Backend (Render/Railway)
```bash
# Push to Git repository
git init
git add .
git commit -m "Initial commit"

# Deploy to Render
# Connect MongoDB Atlas
# Set environment variables
```

### Frontend (Vercel/Netlify)
```bash
npm run build --workspace=client
# Push dist/ folder to Vercel
```

---

## 📝 Sample Database Query

```javascript
// Get flagged transactions
db.transactions.find({ isFlagged: true }).limit(10);

// Get user's trust score progression
db.transactions.find({ userId: "..." }).sort({ timestamp: -1 });

// Get fraud analysis
db.fraudlogs.find({ userId: "..." }).limit(10);
```

---

## 🎓 Learning Resources

- **Fraud Detection**: Statistical anomaly detection methods
- **Explainable AI**: Feature importance, SHAP values, decision trees
- **Real-time Systems**: WebSockets, event streaming
- **UI/UX**: Claymorphism, neumorphism design patterns

---

## 🤝 Contributing

Modifications welcome! Areas to enhance:
- [ ] Advanced ML models (actual Isolation Forest)
- [ ] Email notifications
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Compliance reports (PCI-DSS, GDPR)

---

## ⚠️ Disclaimer

TrustLens is a **demonstration project** for educational and hackathon purposes. For production use in banking:
- Implement proper regulatory compliance
- Add comprehensive security audits
- Use certified ML models
- Maintain regulatory fille
- Implement proper data protection

---

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify MongoDB is running
3. Check environment variables in `.env`
4. Ensure ports 5000 and 5173 are available

---

## 📄 License

MIT - Built for the Hackathon

---

## 🎉 Have Fun!

TrustLens combines cutting-edge AI with delightful UX. Use it to learn, build, and impress!

**Key Takeaway**: Real AI systems should be *explainable*. Users need to understand why they're flagged. TrustLens proves you can do this at scale, beautifully.

---

**Made with ❤️ for the Hackathon**

🚀 Start building: `npm run dev`
