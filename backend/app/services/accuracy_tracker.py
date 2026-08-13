"""
Logs each prediction and later verifies it against actual outcome
to build a rolling "model accuracy" dashboard (MLOps monitoring pattern).

NOTE: This is a simplified in-memory/skeleton version. In production,
replace the list below with actual DB table (see models/ for schema idea).
"""
from datetime import datetime, timedelta

# In-memory placeholder - swap for a real DB table, e.g.:
# predictions(id, coin_id, predicted_direction, confidence, predicted_at, actual_outcome, is_correct)
_prediction_log = []


def log_prediction(coin_id: str, predicted_direction: str, confidence: float):
    _prediction_log.append({
        "coin_id": coin_id,
        "predicted_direction": predicted_direction,
        "confidence": confidence,
        "predicted_at": datetime.utcnow(),
        "actual_outcome": None,
        "is_correct": None,
    })


def resolve_due_predictions(get_current_price_fn):
    """
    Call periodically (e.g. via a cron job / scheduled task).
    Checks predictions older than 48h and resolves them against actual price movement.
    """
    now = datetime.utcnow()
    for record in _prediction_log:
        if record["is_correct"] is None and now - record["predicted_at"] >= timedelta(hours=48):
            current_price = get_current_price_fn(record["coin_id"])
            actual_direction = "UP" if current_price > record.get("price_at_prediction", current_price) else "DOWN"
            record["actual_outcome"] = actual_direction
            record["is_correct"] = actual_direction == record["predicted_direction"]


def get_rolling_accuracy(last_n: int = 30) -> float:
    resolved = [r for r in _prediction_log if r["is_correct"] is not None]
    recent = resolved[-last_n:]
    if not recent:
        return 0.0
    correct = sum(1 for r in recent if r["is_correct"])
    return round((correct / len(recent)) * 100, 2)
