from fastapi import FastAPI, HTTPException
import time
from schemas import ScoringRequest, ScoringResponse
from scoring import calculate_trust_score

app = FastAPI(
    title="TrustLens AI Engine",
    description="Real-time fraud detection and trust scoring microservice.",
    version="1.0.0"
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/trust/score", response_model=ScoringResponse)
async def score_transaction(request: ScoringRequest):
    # Enforce fast execution tracking for low latency guarantee (<200ms)
    start_time = time.time()
    
    try:
        score, risk_level, decision, reasons = calculate_trust_score(request)
        
        # Monitor execution time logging behind the scenes 
        exec_duration_ms = (time.time() - start_time) * 1000
        print(f"[{request.userId}] Execution Latency: {exec_duration_ms:.2f}ms. Decision: {decision.upper()}")
        
        return ScoringResponse(
            score=score,
            riskLevel=risk_level,
            decision=decision,
            reasons=reasons
        )
    except Exception as e:
        print(f"Error processing transaction {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during fraud scoring.")
