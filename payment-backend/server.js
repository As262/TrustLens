const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

// Boot Environment 
dotenv.config();

// Configs
const connectDB = require('./config/db');

// Route Map
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Clean Logging 

// Swagger API Docs Setup
const swaggerDocument = yaml.load(path.join(__dirname, 'docs', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Map Service Traffic to Endpoints array
app.use('/api', apiRoutes);

// General Handlers & Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Payment Orchestrator Node.js' });
});

app.listen(PORT, () => {
  console.log(`Payment Orchestration Backend running on port ${PORT}`);
});
