import os
import pandas as pd
import numpy as np
from xgboost import XGBClassifier, XGBRegressor
from sklearn.metrics import accuracy_score, mean_squared_error, mean_absolute_error
from sklearn.model_selection import train_test_split
import shap
import joblib
from typing import Dict, Any

class CryptoTrendMLModel:
    def __init__(self):
        # 1. Existing Classifier: For UP/DOWN trend direction
        self.model = XGBClassifier(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=4,
            random_state=42,
            eval_metric="logloss"
        )
        
        # 2. Regressor: For Exact Price & 48h Range Prediction
        self.price_model = XGBRegressor(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=4,
            random_state=42
        )
        
        # 3. Model Export Paths
        self.model_dir = "models"
        self.classifier_path = f"{self.model_dir}/xgb_classifier.pkl"
        self.regressor_path = f"{self.model_dir}/xgb_regressor.pkl"
        
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)

    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        ML Model ke liye technical indicator features.
        """
        data = df.copy()

        data["return_1h"] = data["close"].pct_change(1)
        data["return_6h"] = data["close"].pct_change(6)
        data["return_12h"] = data["close"].pct_change(12)
        data["return_24h"] = data["close"].pct_change(24)

        data["sma_20"] = data["close"].rolling(20).mean()
        data["sma_50"] = data["close"].rolling(50).mean()
        data["price_to_sma20"] = data["close"] / data["sma_20"]
        data["price_to_sma50"] = data["close"] / data["sma_50"]

        delta = data["close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean().replace(0, 1e-9)
        rs = gain / loss
        data["rsi_14"] = 100 - (100 / (1 + rs))

        data["volatility_24h"] = data["return_1h"].rolling(24).std()
        data["volume_change_6h"] = data["volume"].pct_change(6)

        return data

    def predict_48h_trend(self, df: pd.DataFrame, hours: int = 1000) -> Dict[str, Any]:
        """
        Complete Prediction Pipeline: Direction + Price Range + Evaluation + SHAP
        """
        if len(df) > (hours + 60):
            df = df.tail(hours + 60)

        if len(df) < 200:
            return {"error": "Insufficient hourly data for ML prediction"}

        # --- FEATURE ENGINEERING ---
        data = self._engineer_features(df)
        LOOKAHEAD = 48
        
        # Targets: Class (UP/DOWN) and Price (Exact future value)
        data["target_class"] = (data["close"].shift(-LOOKAHEAD) > data["close"]).astype(int)
        data["target_price"] = data["close"].shift(-LOOKAHEAD)

        feature_cols = [
            "return_1h", "return_6h", "return_12h", "return_24h",
            "price_to_sma20", "price_to_sma50", "rsi_14",
            "volatility_24h", "volume_change_6h"
        ]

        # Clean NaN values for training target data
        train_data = data.dropna(subset=feature_cols + ["target_class", "target_price"])
        
        # Exact hours slice output match karne ke liye
        if len(train_data) > hours:
            train_data = train_data.tail(hours)

        X = train_data[feature_cols].values
        y_class = train_data["target_class"].values
        y_price = train_data["target_price"].values

        # --- MODEL EVALUATION METRICS (MSE, MAE, ACCURACY) ---
        X_train, X_test, y_train_class, y_test_class = train_test_split(X, y_class, test_size=0.2, shuffle=False)
        _, _, y_train_price, y_test_price = train_test_split(X, y_price, test_size=0.2, shuffle=False)

        # Temporary training for evaluation score
        self.model.fit(X_train, y_train_class)
        self.price_model.fit(X_train, y_train_price)

        class_preds = self.model.predict(X_test)
        price_preds = self.price_model.predict(X_test)

        accuracy = accuracy_score(y_test_class, class_preds)
        mse = mean_squared_error(y_test_price, price_preds)
        mae = mean_absolute_error(y_test_price, price_preds)

        # --- FINAL TRAINING ON FULL DATA & EXPORT ---
        self.model.fit(X, y_class)
        self.price_model.fit(X, y_price)

        # Artifacts Export (.pkl)
        joblib.dump(self.model, self.classifier_path)
        joblib.dump(self.price_model, self.regressor_path)

        # --- LATEST PREDICTION & RANGE CALCULATION ---
        latest_features = data[feature_cols].iloc[-1:].values
        if np.isnan(latest_features).any():
            return {"error": "Unable to compute features for the latest price action"}

        # Direction Predictions
        prediction_class = self.model.predict(latest_features)[0]
        probabilities = self.model.predict_proba(latest_features)[0]
        
        # Price Range Predictions
        predicted_future_price = self.price_model.predict(latest_features)[0]
        current_price = round(float(df["close"].iloc[-1]), 2)
        
        # Dynamic Range
        recent_vol = data["volatility_24h"].iloc[-1]
        if np.isnan(recent_vol): 
            recent_vol = 0.015
        range_buffer = recent_vol * np.sqrt(48) * 100 
        
        min_price = predicted_future_price * (1 - (range_buffer / 100))
        max_price = predicted_future_price * (1 + (range_buffer / 100))

        confidence_pct = round(float(np.max(probabilities)) * 100, 2)
        trend_direction = "UP 🟢" if prediction_class == 1 else "DOWN 🔴"

        # --- SHAP EXPLAINABILITY INTEGRATION ---
        feature_importance = {}
        try:
            explainer = shap.TreeExplainer(self.model)
            shap_values = explainer.shap_values(latest_features)
            
            if isinstance(shap_values, list):
                shap_array = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
            elif len(shap_values.shape) == 2:
                shap_array = shap_values[0]
            else:
                shap_array = shap_values
                
            for i, col in enumerate(feature_cols):
                feature_importance[col] = round(float(shap_array[i]), 4)
        except Exception:
            for col in feature_cols:
                feature_importance[col] = 0.0

        sorted_shap = dict(sorted(feature_importance.items(), key=lambda item: abs(item[1]), reverse=True))

        return {
            "current_price": current_price,
            "prediction_timeframe": "Next 48 Hours",
            "trend_direction": trend_direction,
            "confidence_score_pct": confidence_pct,
            "price_prediction": {
                "target_price": round(float(predicted_future_price), 2),
                "expected_range": {
                    "min": round(float(min_price), 2),
                    "max": round(float(max_price), 2)
                }
            },
            "raw_probabilities": {
                "up_probability": round(float(probabilities[1]) * 100, 2),
                "down_probability": round(float(probabilities[0]) * 100, 2)
            },
            "evaluation_metrics": {
                "directional_accuracy_pct": round(accuracy * 100, 2),
                "mean_absolute_error_mae": round(mae, 2),
                "mean_squared_error_mse": round(mse, 2)
            },
            "shap_explainability": {
                "top_influencing_features": sorted_shap,
                "interpretation": "Positive values pushed the model towards UP, Negative values pushed it towards DOWN."
            },
            "model_info": {
                "algorithms": "XGBoost Classifier + XGBoost Regressor",
                "training_samples_hours": len(train_data),
                "artifacts_saved": [self.classifier_path, self.regressor_path]
            }
        }