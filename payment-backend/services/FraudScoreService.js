const axios = require('axios');
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

class FraudDetectionService {
    static async getTrustScore(payload) {
        try {
            const response = await axios.post(`${FASTAPI_URL}/trust/score`, payload);
            return response.data;
        } catch (error) {
            console.error('Error connecting to AI Engine (FastAPI):', error.message);
            // Safe un-opinionated fallback allowing payment process to continue 
            // if AI engine goes offline temporarily
            return {
                score: 85,
                riskLevel: 'low',
                decision: 'allow',
                reasons: ['FastAPI AI Engine unreachable, executing fallback logic constraint.']
            };
        }
    }
}

module.exports = FraudDetectionService;
