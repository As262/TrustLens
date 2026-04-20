import statistics
from typing import Tuple, List
from schemas import ScoringRequest, PastTransaction

# --- Risk Factor Modules ---

def _check_amount_anomaly(amount: float, past_txs: List[PastTransaction]) -> Tuple[int, str]:
    if not past_txs:
        return 0, ""
    
    past_amounts = [t.amount for t in past_txs if t.amount > 0]
    if not past_amounts:
        return 0, ""
        
    avg_amount = statistics.mean(past_amounts)
    # Penalize if amount is exponentially higher than the user's average (e.g., > 3x average)
    if amount > avg_amount * 3:
        return -20, f"Unusually high transaction amount: {amount} (Avg: {avg_amount:.2f})"
        
    return 0, ""

def _check_device_anomalies(device_id: str, past_txs: List[PastTransaction]) -> Tuple[int, str]:
    if not past_txs:
        return 0, ""
        
    known_devices = {t.deviceId for t in past_txs if t.deviceId}
    if known_devices and device_id not in known_devices:
        return -15, "Transaction from an unknown/new device"
    elif device_id in known_devices:
        return +5, "Recognized, trusted device used"
    
    return 0, ""

def _check_location_anomalies(location: str, past_txs: List[PastTransaction]) -> Tuple[int, str]:
    if not past_txs:
        return 0, ""
    
    known_locations = {t.location for t in past_txs if t.location}
    if known_locations and location not in known_locations:
        return -20, "Transaction from an unknown/new location"
    elif location in known_locations:
        return +5, "Recognized, trusted location used"
        
    return 0, ""

def _check_historical_flags_and_scores(past_txs: List[PastTransaction]) -> Tuple[int, List[str]]:
    deductions = 0
    reasons = []
    
    if not past_txs:
        return 0, reasons
        
    flagged_count = sum(1 for t in past_txs if t.isFlagged)
    if flagged_count > 0:
        deductions -= (15 * flagged_count)
        reasons.append(f"User history contains {flagged_count} flagged transaction(s)")
        
    past_fraud_scores = [t.fraudScore for t in past_txs if t.fraudScore and t.fraudScore > 0]
    if past_fraud_scores:
        avg_fraud_score = statistics.mean(past_fraud_scores)
        if avg_fraud_score > 60:
            deductions -= 25
            reasons.append(f"High average historical fraud score ({avg_fraud_score:.1f})")
            
    if flagged_count == 0 and not past_fraud_scores:
        return +10, ["Clean recent transaction history"]
            
    return deductions, reasons

# --- Placeholder ML Model ---

def _predict_fraud_ml(req: ScoringRequest) -> Tuple[int, str]:
    # Future upgrade placeholder for real ML model bounds (XGBoost, RandomForest, etc.)
    # Returns an adjustment to the score and a reason/insight.
    return 0, "ML Prediction: Pending Model Integration"

# --- Main Scoring Orchestrator ---

def calculate_trust_score(req: ScoringRequest) -> Tuple[int, str, str, List[str]]:
    score = 100
    reasons = []
    
    # Run modular checks
    amt_score, amt_reason = _check_amount_anomaly(req.amount, req.transactions)
    score += amt_score
    if amt_reason: reasons.append(amt_reason)
        
    dev_score, dev_reason = _check_device_anomalies(req.deviceId, req.transactions)
    score += dev_score
    if dev_reason: reasons.append(dev_reason)
        
    loc_score, loc_reason = _check_location_anomalies(req.location, req.transactions)
    score += loc_score
    if loc_reason: reasons.append(loc_reason)
        
    hist_score, hist_reasons = _check_historical_flags_and_scores(req.transactions)
    score += hist_score
    if hist_reasons: reasons.extend(hist_reasons)
        
    # Optional ML integration block (Does not affect score right now)
    ml_score, ml_reason = _predict_fraud_ml(req)
    if ml_reason: reasons.append(ml_reason)
    
    # Cap score boundaries
    score = max(0, min(100, score))
    
    # Determine risk level and decision based on rules
    if score >= 80:
        risk_level = "low"
        decision = "allow"
    elif 50 <= score < 80:
        risk_level = "medium"
        decision = "review"
    else:
        risk_level = "high"
        decision = "block"
        
    if not reasons:
        reasons.append("Typical transaction with no significant anomalies.")
        
    return score, risk_level, decision, reasons
