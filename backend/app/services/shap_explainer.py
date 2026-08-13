"""
Explainable AI (XAI) layer using SHAP.
Explains WHY the model predicted a given direction, per feature.
"""
import shap
import pandas as pd


def explain_prediction(model, latest_features: dict, feature_columns: list) -> dict:
    """
    Returns a per-feature contribution breakdown for a single prediction,
    e.g. {"rsi_14": 0.35, "news_sentiment": 0.25, "sma_20": 0.22, "fear_greed": 0.18}
    """
    X = pd.DataFrame([latest_features])[feature_columns]

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    # shap_values[0] -> contributions for class 0; for binary classifiers use shap_values[1] for "UP" class
    contributions = dict(zip(feature_columns, shap_values[0]))

    # Normalize to percentages for easy frontend display
    total = sum(abs(v) for v in contributions.values()) or 1
    breakdown = {k: round(abs(v) / total * 100, 1) for k, v in contributions.items()}

    return dict(sorted(breakdown.items(), key=lambda x: x[1], reverse=True))
