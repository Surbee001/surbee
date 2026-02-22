"""
Cipher ML - XGBoost Training and Inference on Modal

This module provides:
1. Training endpoint: Trains XGBoost model on synthetic/real data
2. Inference endpoint: Real-time fraud probability scoring
3. Model versioning and artifact storage
"""

import modal
import json
import os
from datetime import datetime, timezone
from typing import Optional

# Create the Modal app
app = modal.App("cipher-ml")

# Volume for storing model artifacts
model_volume = modal.Volume.from_name("cipher-ml-models", create_if_missing=True)

# Image with ML dependencies
ml_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "xgboost==2.0.3",
        "scikit-learn==1.4.0",
        "numpy==1.26.3",
        "pandas==2.1.4",
        "fastapi[standard]",
        "uvicorn",
    )
)

# Feature names must match TypeScript FEATURE_NAMES order
FEATURE_NAMES = [
    # Behavioral (25)
    'mouseDistanceTotal', 'mouseVelocityMean', 'mouseVelocityStd', 'mouseVelocityMax',
    'mouseAccelerationMean', 'mouseCurvatureEntropy', 'mouseStraightLineRatio', 'mousePauseCount',
    'keystrokeCount', 'keystrokeTimingMean', 'keystrokeTimingStd', 'keystrokeDwellMean',
    'keystrokeFlightMean', 'backspaceRatio', 'pasteEventCount', 'pasteCharRatio',
    'scrollCount', 'scrollVelocityMean', 'scrollDirectionChanges', 'focusLossCount',
    'focusLossDurationTotal', 'hoverCount', 'hoverDurationMean', 'clickCount', 'hoverBeforeClickRatio',
    # Temporal (12)
    'completionTimeSeconds', 'timePerQuestionMean', 'timePerQuestionStd', 'timePerQuestionMin',
    'timePerQuestionMax', 'readingVsAnsweringRatio', 'firstInteractionDelayMs', 'idleTimeTotal',
    'activeTimeRatio', 'responseAcceleration', 'timeOfDayHour', 'dayOfWeek',
    # Device (10)
    'hasWebdriver', 'hasAutomationFlags', 'pluginCount', 'screenResolutionCommon',
    'timezoneOffsetMinutes', 'timezoneMatchesIp', 'fingerprintSeenCount', 'deviceMemoryGb',
    'hardwareConcurrency', 'touchSupport',
    # Network (8)
    'isVpn', 'isDatacenter', 'isTor', 'isProxy', 'ipReputationScore', 'ipCountryCode',
    'geoTimezoneMatch', 'ipSeenCount',
    # Content (15)
    'questionCount', 'openEndedCount', 'openEndedLengthMean', 'openEndedLengthStd',
    'openEndedWordCountMean', 'openEndedUniqueWordRatio', 'straightLineRatio', 'answerEntropy',
    'firstOptionRatio', 'lastOptionRatio', 'middleOptionRatio', 'responseUniquenessScore',
    'duplicateAnswerRatio', 'naRatio', 'skipRatio',
    # Honeypot (5)
    'attentionCheckPassed', 'attentionCheckCount', 'consistencyCheckScore', 'trapFieldFilled', 'honeypotScore',
]

# Feature importance names for top signals
FEATURE_DISPLAY_NAMES = {
    'mouseDistanceTotal': 'Mouse Distance',
    'mouseVelocityMean': 'Mouse Speed',
    'mouseVelocityStd': 'Mouse Speed Variance',
    'mouseCurvatureEntropy': 'Mouse Path Naturalness',
    'mouseStraightLineRatio': 'Straight Line Mouse Movements',
    'keystrokeCount': 'Keystrokes',
    'keystrokeTimingMean': 'Typing Speed',
    'keystrokeTimingStd': 'Typing Consistency',
    'backspaceRatio': 'Correction Rate',
    'pasteEventCount': 'Paste Events',
    'pasteCharRatio': 'Pasted Content Ratio',
    'completionTimeSeconds': 'Completion Time',
    'timePerQuestionMean': 'Time Per Question',
    'activeTimeRatio': 'Active Engagement',
    'hasWebdriver': 'Automation Detected',
    'hasAutomationFlags': 'Bot Flags',
    'isVpn': 'VPN Usage',
    'isDatacenter': 'Datacenter IP',
    'isTor': 'Tor Usage',
    'straightLineRatio': 'Answer Straight-lining',
    'answerEntropy': 'Answer Diversity',
    'honeypotScore': 'Honeypot Failures',
    'attentionCheckPassed': 'Attention Check',
    'trapFieldFilled': 'Trap Field Triggered',
}


def get_display_name(feature: str) -> str:
    """Get human-readable feature name."""
    return FEATURE_DISPLAY_NAMES.get(feature, feature)


@app.function(
    image=ml_image,
    volumes={"/models": model_volume},
    timeout=1800,  # 30 minutes for training
    cpu=4.0,
    memory=8192,
)
def train_model(
    X: list[list[float]],
    y: list[int],
    model_version: str,
    metadata: Optional[dict] = None,
) -> dict:
    """
    Train an XGBoost model on the provided data.

    Args:
        X: Feature matrix (N x 75)
        y: Labels (0 = legitimate, 1 = fraud)
        model_version: Version string for this model (e.g., "v1.0.0")
        metadata: Optional training metadata

    Returns:
        Training results including metrics and model path
    """
    import numpy as np
    import xgboost as xgb
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import (
        precision_score, recall_score, f1_score, roc_auc_score,
        confusion_matrix, classification_report
    )
    import pickle

    print(f"[Cipher ML] Starting training for model {model_version}")
    print(f"[Cipher ML] Dataset: {len(X)} samples, {len(X[0])} features")

    # Convert to numpy
    X = np.array(X)
    y = np.array(y)

    # Check class balance
    fraud_count = np.sum(y == 1)
    legit_count = np.sum(y == 0)
    print(f"[Cipher ML] Class distribution: {fraud_count} fraud, {legit_count} legitimate")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[Cipher ML] Train: {len(X_train)}, Test: {len(X_test)}")

    # Calculate scale_pos_weight for imbalanced data
    scale_pos_weight = legit_count / fraud_count if fraud_count > 0 else 1

    # XGBoost parameters optimized for fraud detection
    params = {
        'objective': 'binary:logistic',
        'eval_metric': ['auc', 'logloss'],
        'max_depth': 6,
        'learning_rate': 0.1,
        'n_estimators': 200,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'min_child_weight': 3,
        'gamma': 0.1,
        'scale_pos_weight': scale_pos_weight,
        'random_state': 42,
        'n_jobs': -1,
    }

    # Train model
    print("[Cipher ML] Training XGBoost model...")
    model = xgb.XGBClassifier(**params)

    # Fit with early stopping
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=True
    )

    # Predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]

    # Calculate metrics
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_pred_proba)

    print(f"[Cipher ML] Results:")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall: {recall:.4f}")
    print(f"  F1 Score: {f1:.4f}")
    print(f"  AUC-ROC: {auc_roc:.4f}")
    print(f"\n{classification_report(y_test, y_pred, target_names=['Legitimate', 'Fraud'])}")

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print(f"[Cipher ML] Confusion Matrix:")
    print(f"  TN: {cm[0][0]}, FP: {cm[0][1]}")
    print(f"  FN: {cm[1][0]}, TP: {cm[1][1]}")

    # Feature importance
    importance = model.feature_importances_
    feature_importance = sorted(
        zip(FEATURE_NAMES, importance),
        key=lambda x: x[1],
        reverse=True
    )

    print(f"\n[Cipher ML] Top 15 Features:")
    for name, imp in feature_importance[:15]:
        print(f"  {get_display_name(name)}: {imp:.4f}")

    # Save model
    model_dir = f"/models/{model_version}"
    os.makedirs(model_dir, exist_ok=True)

    model_path = f"{model_dir}/model.json"
    model.save_model(model_path)
    print(f"[Cipher ML] Model saved to {model_path}")

    # Save metadata
    model_metadata = {
        "version": model_version,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "feature_names": FEATURE_NAMES,
        "feature_count": len(FEATURE_NAMES),
        "training_samples": len(X),
        "fraud_samples": int(fraud_count),
        "legitimate_samples": int(legit_count),
        "metrics": {
            "precision": float(precision),
            "recall": float(recall),
            "f1": float(f1),
            "auc_roc": float(auc_roc),
        },
        "confusion_matrix": {
            "tn": int(cm[0][0]),
            "fp": int(cm[0][1]),
            "fn": int(cm[1][0]),
            "tp": int(cm[1][1]),
        },
        "feature_importance": [
            {"name": name, "importance": float(imp)}
            for name, imp in feature_importance[:30]
        ],
        "hyperparameters": params,
        "user_metadata": metadata,
    }

    metadata_path = f"{model_dir}/metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(model_metadata, f, indent=2)

    # Commit the volume to persist
    model_volume.commit()

    print(f"[Cipher ML] Training complete!")

    return {
        "success": True,
        "model_version": model_version,
        "model_path": model_path,
        "metrics": {
            "precision": float(precision),
            "recall": float(recall),
            "f1": float(f1),
            "auc_roc": float(auc_roc),
        },
        "training_samples": len(X),
        "fraud_samples": int(fraud_count),
        "legitimate_samples": int(legit_count),
        "top_features": [
            {"name": name, "display_name": get_display_name(name), "importance": float(imp)}
            for name, imp in feature_importance[:10]
        ],
    }


@app.function(
    image=ml_image,
    volumes={"/models": model_volume},
    timeout=30,
    cpu=0.5,
    memory=512,
)
def predict(
    features: list[float],
    model_version: str = "latest",
) -> dict:
    """
    Make a fraud prediction for a single response.

    Args:
        features: Feature vector (75 dimensions)
        model_version: Model version to use (default: "latest")

    Returns:
        Prediction result with probability and top signals
    """
    import numpy as np
    import xgboost as xgb
    import time

    start_time = time.time()

    # Find model path
    if model_version == "latest":
        # Find the latest model
        model_dirs = [d for d in os.listdir("/models") if os.path.isdir(f"/models/{d}")]
        if not model_dirs:
            return {"error": "No models found", "success": False}
        model_version = sorted(model_dirs)[-1]

    model_path = f"/models/{model_version}/model.json"
    if not os.path.exists(model_path):
        return {"error": f"Model {model_version} not found", "success": False}

    # Load model
    model = xgb.XGBClassifier()
    model.load_model(model_path)

    # Make prediction
    X = np.array([features])
    proba = model.predict_proba(X)[0, 1]

    # Determine verdict
    if proba < 0.3:
        verdict = "low_risk"
    elif proba < 0.5:
        verdict = "medium_risk"
    elif proba < 0.7:
        verdict = "high_risk"
    else:
        verdict = "fraud"

    # Get feature contributions using feature importance
    importance = model.feature_importances_

    # Find top contributing features for this prediction
    feature_values = np.array(features)
    contributions = []

    for i, (name, imp) in enumerate(zip(FEATURE_NAMES, importance)):
        if imp > 0.01:  # Only include significant features
            contributions.append({
                "feature": name,
                "display_name": get_display_name(name),
                "importance": float(imp),
                "value": float(feature_values[i]) if i < len(feature_values) else None,
            })

    # Sort by importance and take top 5
    top_signals = sorted(contributions, key=lambda x: x["importance"], reverse=True)[:5]

    inference_time_ms = int((time.time() - start_time) * 1000)

    return {
        "success": True,
        "fraud_probability": float(proba),
        "fraud_verdict": verdict,
        "confidence": float(1 - abs(0.5 - proba) * 2),  # Higher near 0 or 1
        "model_version": model_version,
        "top_signals": top_signals,
        "inference_time_ms": inference_time_ms,
    }


@app.function(
    image=ml_image,
    volumes={"/models": model_volume},
    timeout=60,
    cpu=1.0,
    memory=1024,
)
def predict_batch(
    features_batch: list[list[float]],
    model_version: str = "latest",
) -> dict:
    """
    Make fraud predictions for multiple responses.

    Args:
        features_batch: List of feature vectors
        model_version: Model version to use

    Returns:
        Batch prediction results
    """
    import numpy as np
    import xgboost as xgb
    import time

    start_time = time.time()

    # Find model path
    if model_version == "latest":
        model_dirs = [d for d in os.listdir("/models") if os.path.isdir(f"/models/{d}")]
        if not model_dirs:
            return {"error": "No models found", "success": False}
        model_version = sorted(model_dirs)[-1]

    model_path = f"/models/{model_version}/model.json"
    if not os.path.exists(model_path):
        return {"error": f"Model {model_version} not found", "success": False}

    # Load model
    model = xgb.XGBClassifier()
    model.load_model(model_path)

    # Make predictions
    X = np.array(features_batch)
    probas = model.predict_proba(X)[:, 1]

    # Build results
    results = []
    for proba in probas:
        if proba < 0.3:
            verdict = "low_risk"
        elif proba < 0.5:
            verdict = "medium_risk"
        elif proba < 0.7:
            verdict = "high_risk"
        else:
            verdict = "fraud"

        results.append({
            "fraud_probability": float(proba),
            "fraud_verdict": verdict,
        })

    inference_time_ms = int((time.time() - start_time) * 1000)

    return {
        "success": True,
        "model_version": model_version,
        "predictions": results,
        "count": len(results),
        "inference_time_ms": inference_time_ms,
    }


@app.function(
    image=ml_image,
    volumes={"/models": model_volume},
)
def list_models() -> dict:
    """List all available models."""
    models = []

    model_dirs = [d for d in os.listdir("/models") if os.path.isdir(f"/models/{d}")]

    for version in sorted(model_dirs, reverse=True):
        metadata_path = f"/models/{version}/metadata.json"
        if os.path.exists(metadata_path):
            with open(metadata_path) as f:
                metadata = json.load(f)
            models.append({
                "version": version,
                "created_at": metadata.get("created_at"),
                "metrics": metadata.get("metrics"),
                "training_samples": metadata.get("training_samples"),
            })
        else:
            models.append({"version": version, "metadata": "not found"})

    return {"models": models, "count": len(models)}


@app.function(
    image=ml_image,
    volumes={"/models": model_volume},
)
def get_model_info(model_version: str = "latest") -> dict:
    """Get detailed information about a specific model."""
    if model_version == "latest":
        model_dirs = [d for d in os.listdir("/models") if os.path.isdir(f"/models/{d}")]
        if not model_dirs:
            return {"error": "No models found"}
        model_version = sorted(model_dirs)[-1]

    metadata_path = f"/models/{model_version}/metadata.json"
    if not os.path.exists(metadata_path):
        return {"error": f"Model {model_version} not found"}

    with open(metadata_path) as f:
        return json.load(f)


# FastAPI inference server for low-latency predictions
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

inference_app = FastAPI(title="Cipher ML Inference")


class PredictRequest(BaseModel):
    features: List[float]
    model_version: str = "latest"


class PredictBatchRequest(BaseModel):
    features_batch: List[List[float]]
    model_version: str = "latest"


# Global model cache for the inference server
_model_cache = {}


def get_cached_model(model_version: str):
    """Get model from cache or load it."""
    import xgboost as xgb

    if model_version == "latest":
        model_dirs = [d for d in os.listdir("/models") if os.path.isdir(f"/models/{d}")]
        if not model_dirs:
            raise HTTPException(status_code=404, detail="No models found")
        model_version = sorted(model_dirs)[-1]

    if model_version not in _model_cache:
        model_path = f"/models/{model_version}/model.json"
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model {model_version} not found")

        model = xgb.XGBClassifier()
        model.load_model(model_path)
        _model_cache[model_version] = model

    return _model_cache[model_version], model_version


@inference_app.post("/predict")
async def api_predict(request: PredictRequest):
    """Make a single prediction."""
    import numpy as np
    import time

    start_time = time.time()

    model, version = get_cached_model(request.model_version)

    X = np.array([request.features])
    proba = model.predict_proba(X)[0, 1]

    if proba < 0.3:
        verdict = "low_risk"
    elif proba < 0.5:
        verdict = "medium_risk"
    elif proba < 0.7:
        verdict = "high_risk"
    else:
        verdict = "fraud"

    # Get top signals
    importance = model.feature_importances_
    contributions = []
    for i, (name, imp) in enumerate(zip(FEATURE_NAMES, importance)):
        if imp > 0.01:
            contributions.append({
                "feature": name,
                "display_name": get_display_name(name),
                "importance": float(imp),
                "value": float(request.features[i]) if i < len(request.features) else None,
            })
    top_signals = sorted(contributions, key=lambda x: x["importance"], reverse=True)[:5]

    return {
        "fraud_probability": float(proba),
        "fraud_verdict": verdict,
        "confidence": float(1 - abs(0.5 - proba) * 2),
        "model_version": version,
        "top_signals": top_signals,
        "inference_time_ms": int((time.time() - start_time) * 1000),
    }


@inference_app.post("/predict/batch")
async def api_predict_batch(request: PredictBatchRequest):
    """Make batch predictions."""
    import numpy as np
    import time

    start_time = time.time()

    model, version = get_cached_model(request.model_version)

    X = np.array(request.features_batch)
    probas = model.predict_proba(X)[:, 1]

    results = []
    for proba in probas:
        if proba < 0.3:
            verdict = "low_risk"
        elif proba < 0.5:
            verdict = "medium_risk"
        elif proba < 0.7:
            verdict = "high_risk"
        else:
            verdict = "fraud"
        results.append({
            "fraud_probability": float(proba),
            "fraud_verdict": verdict,
        })

    return {
        "predictions": results,
        "model_version": version,
        "count": len(results),
        "inference_time_ms": int((time.time() - start_time) * 1000),
    }


@inference_app.get("/models")
async def api_list_models():
    """List available models."""
    models = []
    model_dirs = [d for d in os.listdir("/models") if os.path.isdir(f"/models/{d}")]

    for version in sorted(model_dirs, reverse=True):
        metadata_path = f"/models/{version}/metadata.json"
        if os.path.exists(metadata_path):
            with open(metadata_path) as f:
                metadata = json.load(f)
            models.append({
                "version": version,
                "created_at": metadata.get("created_at"),
                "metrics": metadata.get("metrics"),
            })

    return {"models": models}


@inference_app.get("/health")
async def api_health():
    """Health check."""
    return {"status": "ok"}


@app.function(
    image=ml_image,
    volumes={"/models": model_volume},
    cpu=1.0,
    memory=1024,
    scaledown_window=300,  # Keep warm for 5 minutes
)
@modal.asgi_app()
def inference_server():
    """ASGI inference server for low-latency predictions."""
    return inference_app


if __name__ == "__main__":
    # For local testing
    app.serve()
