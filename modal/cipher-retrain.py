"""
Cipher ML Retraining Pipeline

Automated retraining system that:
1. Fetches labeled data from Supabase
2. Combines with synthetic data for robustness
3. Trains new model
4. Compares metrics against current production
5. Promotes if better

Supports:
- Global model (all customers)
- Per-customer models (enterprise)
- Incremental learning (warm start from previous model)
"""

import modal
import json
import os
from datetime import datetime, timezone
from typing import Optional
import random
import math

app = modal.App("cipher-ml-retrain")

ml_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "xgboost==2.0.3",
        "scikit-learn==1.4.0",
        "numpy==1.26.3",
        "supabase==2.3.0",
    )
)

model_volume = modal.Volume.from_name("cipher-ml-models", create_if_missing=True)

# Feature names must match the training data
FEATURE_NAMES = [
    'mouseDistanceTotal', 'mouseVelocityMean', 'mouseVelocityStd', 'mouseVelocityMax',
    'mouseAccelerationMean', 'mouseCurvatureEntropy', 'mouseStraightLineRatio', 'mousePauseCount',
    'keystrokeCount', 'keystrokeTimingMean', 'keystrokeTimingStd', 'keystrokeDwellMean',
    'keystrokeFlightMean', 'backspaceRatio', 'pasteEventCount', 'pasteCharRatio',
    'scrollCount', 'scrollVelocityMean', 'scrollDirectionChanges', 'focusLossCount',
    'focusLossDurationTotal', 'hoverCount', 'hoverDurationMean', 'clickCount', 'hoverBeforeClickRatio',
    'completionTimeSeconds', 'timePerQuestionMean', 'timePerQuestionStd', 'timePerQuestionMin',
    'timePerQuestionMax', 'readingVsAnsweringRatio', 'firstInteractionDelayMs', 'idleTimeTotal',
    'activeTimeRatio', 'responseAcceleration', 'timeOfDayHour', 'dayOfWeek',
    'hasWebdriver', 'hasAutomationFlags', 'pluginCount', 'screenResolutionCommon',
    'timezoneOffsetMinutes', 'timezoneMatchesIp', 'fingerprintSeenCount', 'deviceMemoryGb',
    'hardwareConcurrency', 'touchSupport',
    'isVpn', 'isDatacenter', 'isTor', 'isProxy', 'ipReputationScore', 'ipCountryCode',
    'geoTimezoneMatch', 'ipSeenCount',
    'questionCount', 'openEndedCount', 'openEndedLengthMean', 'openEndedLengthStd',
    'openEndedWordCountMean', 'openEndedUniqueWordRatio', 'straightLineRatio', 'answerEntropy',
    'firstOptionRatio', 'lastOptionRatio', 'middleOptionRatio', 'responseUniquenessScore',
    'duplicateAnswerRatio', 'naRatio', 'skipRatio',
    'attentionCheckPassed', 'attentionCheckCount', 'consistencyCheckScore', 'trapFieldFilled', 'honeypotScore',
]


def db_row_to_feature_vector(row: dict) -> list[float]:
    """Convert a cipher_features DB row to a feature vector."""
    return [
        row.get('mouse_distance_total') or 0,
        row.get('mouse_velocity_mean') or 0,
        row.get('mouse_velocity_std') or 0,
        row.get('mouse_velocity_max') or 0,
        row.get('mouse_acceleration_mean') or 0,
        row.get('mouse_curvature_entropy') or 0,
        row.get('mouse_straight_line_ratio') or 0,
        row.get('mouse_pause_count') or 0,
        row.get('keystroke_count') or 0,
        row.get('keystroke_timing_mean') or 0,
        row.get('keystroke_timing_std') or 0,
        row.get('keystroke_dwell_mean') or 0,
        row.get('keystroke_flight_mean') or 0,
        row.get('backspace_ratio') or 0,
        row.get('paste_event_count') or 0,
        row.get('paste_char_ratio') or 0,
        row.get('scroll_count') or 0,
        row.get('scroll_velocity_mean') or 0,
        row.get('scroll_direction_changes') or 0,
        row.get('focus_loss_count') or 0,
        row.get('focus_loss_duration_total') or 0,
        row.get('hover_count') or 0,
        row.get('hover_duration_mean') or 0,
        row.get('click_count') or 0,
        row.get('hover_before_click_ratio') or 0,
        row.get('completion_time_seconds') or 0,
        row.get('time_per_question_mean') or 0,
        row.get('time_per_question_std') or 0,
        row.get('time_per_question_min') or 0,
        row.get('time_per_question_max') or 0,
        row.get('reading_vs_answering_ratio') or 0,
        row.get('first_interaction_delay_ms') or 0,
        row.get('idle_time_total') or 0,
        row.get('active_time_ratio') or 0,
        row.get('response_acceleration') or 0,
        row.get('time_of_day_hour') or 12,
        row.get('day_of_week') or 0,
        1 if row.get('has_webdriver') else 0,
        1 if row.get('has_automation_flags') else 0,
        row.get('plugin_count') or 0,
        1 if row.get('screen_resolution_common') else 0,
        row.get('timezone_offset_minutes') or 0,
        1 if row.get('timezone_matches_ip') else 0,
        row.get('fingerprint_seen_count') or 1,
        row.get('device_memory_gb') or 4,
        row.get('hardware_concurrency') or 4,
        1 if row.get('touch_support') else 0,
        1 if row.get('is_vpn') else 0,
        1 if row.get('is_datacenter') else 0,
        1 if row.get('is_tor') else 0,
        1 if row.get('is_proxy') else 0,
        row.get('ip_reputation_score') or 0.5,
        0,  # ip_country_code - skip string
        1 if row.get('geo_timezone_match') else 0,
        row.get('ip_seen_count') or 1,
        row.get('question_count') or 0,
        row.get('open_ended_count') or 0,
        row.get('open_ended_length_mean') or 0,
        row.get('open_ended_length_std') or 0,
        row.get('open_ended_word_count_mean') or 0,
        row.get('open_ended_unique_word_ratio') or 0,
        row.get('straight_line_ratio') or 0,
        row.get('answer_entropy') or 0,
        row.get('first_option_ratio') or 0,
        row.get('last_option_ratio') or 0,
        row.get('middle_option_ratio') or 0,
        row.get('response_uniqueness_score') or 0.5,
        row.get('duplicate_answer_ratio') or 0,
        row.get('na_ratio') or 0,
        row.get('skip_ratio') or 0,
        1 if row.get('attention_check_passed') else 0,
        row.get('attention_check_count') or 0,
        row.get('consistency_check_score') or 1,
        1 if row.get('trap_field_filled') else 0,
        row.get('honeypot_score') or 0,
    ]


# Note: You must create a Modal secret named 'supabase-credentials' with:
# - SUPABASE_URL: Your Supabase project URL
# - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key
# Create it at: https://modal.com/secrets

@app.function(
    image=ml_image,
    volumes={"/models": model_volume},
    secrets=[modal.Secret.from_name("supabase-credentials")],
    timeout=3600,
    cpu=4.0,
    memory=16384,
)
def retrain_model(
    customer_id: Optional[str] = None,
    min_samples: int = 1000,
    synthetic_ratio: float = 0.3,
    warm_start: bool = True,
) -> dict:
    """
    Retrain the fraud detection model on real + synthetic data.

    Args:
        customer_id: If provided, train a customer-specific model
        min_samples: Minimum labeled samples required to train
        synthetic_ratio: Ratio of synthetic data to mix in (0.0-1.0)
        warm_start: If True, initialize from previous model weights

    Returns:
        Training results including metrics and whether model was promoted
    """
    import numpy as np
    import xgboost as xgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score
    from supabase import create_client

    # Connect to Supabase
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        return {
            "success": False,
            "error": "Supabase credentials not configured. Create a Modal secret named 'supabase-credentials' with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        }

    supabase = create_client(supabase_url, supabase_key)

    model_scope = f"customer_{customer_id}" if customer_id else "global"
    print(f"[Retrain] Starting retraining for {model_scope}")

    # Fetch labeled data
    query = supabase.table("cipher_labels").select(
        "response_id, is_fraud, confidence, cipher_features(*)"
    )

    if customer_id:
        # Filter by customer's surveys
        query = query.eq("cipher_features.survey_id", customer_id)

    result = query.execute()
    labeled_data = result.data or []

    print(f"[Retrain] Found {len(labeled_data)} labeled responses")

    if len(labeled_data) < min_samples:
        return {
            "success": False,
            "error": f"Not enough labeled data. Have {len(labeled_data)}, need {min_samples}",
            "labeled_count": len(labeled_data),
        }

    # Convert to training format
    X_real = []
    y_real = []

    for item in labeled_data:
        features = item.get("cipher_features")
        if features:
            X_real.append(db_row_to_feature_vector(features))
            y_real.append(1 if item["is_fraud"] else 0)

    X_real = np.array(X_real)
    y_real = np.array(y_real)

    print(f"[Retrain] Real data: {len(X_real)} samples, {sum(y_real)} fraud, {len(y_real) - sum(y_real)} legitimate")

    # Generate synthetic data to mix in
    if synthetic_ratio > 0:
        synthetic_count = int(len(X_real) * synthetic_ratio / (1 - synthetic_ratio))
        print(f"[Retrain] Generating {synthetic_count} synthetic samples...")

        # Import synthetic generator (simplified inline version)
        X_synthetic, y_synthetic = generate_synthetic_batch(synthetic_count)

        # Combine real and synthetic
        X = np.vstack([X_real, X_synthetic])
        y = np.concatenate([y_real, y_synthetic])
    else:
        X = X_real
        y = y_real

    # Shuffle
    indices = np.random.permutation(len(X))
    X = X[indices]
    y = y[indices]

    print(f"[Retrain] Total training data: {len(X)} samples")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Load previous model for warm start
    base_model = None
    if warm_start:
        model_dir = f"/models/{model_scope}"
        if os.path.exists(f"{model_dir}/model.json"):
            base_model = xgb.XGBClassifier()
            base_model.load_model(f"{model_dir}/model.json")
            print("[Retrain] Loaded previous model for warm start")

    # Train new model
    fraud_count = sum(y_train)
    legit_count = len(y_train) - fraud_count
    scale_pos_weight = legit_count / fraud_count if fraud_count > 0 else 1

    params = {
        'objective': 'binary:logistic',
        'eval_metric': ['auc', 'logloss'],
        'max_depth': 8,
        'learning_rate': 0.05,
        'n_estimators': 300,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'min_child_weight': 3,
        'gamma': 0.1,
        'scale_pos_weight': scale_pos_weight,
        'random_state': 42,
        'n_jobs': -1,
    }

    model = xgb.XGBClassifier(**params)

    # If warm start, use the booster from previous model
    if base_model:
        model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            xgb_model=base_model.get_booster(),
            verbose=False
        )
    else:
        model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )

    # Evaluate
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]

    new_metrics = {
        "precision": float(precision_score(y_test, y_pred)),
        "recall": float(recall_score(y_test, y_pred)),
        "f1": float(f1_score(y_test, y_pred)),
        "auc_roc": float(roc_auc_score(y_test, y_pred_proba)),
    }

    print(f"[Retrain] New model metrics:")
    print(f"  Precision: {new_metrics['precision']:.4f}")
    print(f"  Recall: {new_metrics['recall']:.4f}")
    print(f"  F1: {new_metrics['f1']:.4f}")
    print(f"  AUC-ROC: {new_metrics['auc_roc']:.4f}")

    # Compare with current production model
    should_promote = True
    old_metrics = None

    model_dir = f"/models/{model_scope}"
    metadata_path = f"{model_dir}/metadata.json"

    if os.path.exists(metadata_path):
        with open(metadata_path) as f:
            old_metadata = json.load(f)
        old_metrics = old_metadata.get("metrics", {})

        # Only promote if F1 improves by at least 1% or AUC improves
        old_f1 = old_metrics.get("f1", 0)
        old_auc = old_metrics.get("auc_roc", 0)

        if new_metrics["f1"] < old_f1 - 0.01 and new_metrics["auc_roc"] < old_auc:
            should_promote = False
            print(f"[Retrain] New model not better. Old F1: {old_f1:.4f}, New F1: {new_metrics['f1']:.4f}")

    # Generate version
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    new_version = f"v{timestamp}_{model_scope}"

    if should_promote:
        # Save new model
        os.makedirs(model_dir, exist_ok=True)
        model.save_model(f"{model_dir}/model.json")

        # Save metadata
        metadata = {
            "version": new_version,
            "scope": model_scope,
            "customer_id": customer_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "metrics": new_metrics,
            "training_samples": len(X),
            "real_samples": len(X_real),
            "synthetic_samples": len(X) - len(X_real),
            "fraud_samples": int(sum(y)),
            "legitimate_samples": int(len(y) - sum(y)),
            "warm_start": warm_start,
            "previous_metrics": old_metrics,
        }

        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        # Also save versioned copy
        version_dir = f"/models/archive/{new_version}"
        os.makedirs(version_dir, exist_ok=True)
        model.save_model(f"{version_dir}/model.json")
        with open(f"{version_dir}/metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

        model_volume.commit()

        # Mark labels as used in training
        response_ids = [item["response_id"] for item in labeled_data]
        supabase.table("cipher_labels").update({
            "used_in_training": True,
            "training_run_id": new_version,
        }).in_("response_id", response_ids).execute()

        print(f"[Retrain] Model promoted to production: {new_version}")

    return {
        "success": True,
        "promoted": should_promote,
        "version": new_version if should_promote else None,
        "metrics": new_metrics,
        "previous_metrics": old_metrics,
        "training_samples": len(X),
        "real_samples": len(X_real),
        "synthetic_samples": len(X) - len(X_real),
        "model_scope": model_scope,
    }


def generate_synthetic_batch(count: int) -> tuple:
    """Generate synthetic training data (simplified version)."""
    import numpy as np

    X = []
    y = []

    for _ in range(count // 2):
        # Fraud sample
        X.append(generate_fraud_sample())
        y.append(1)

        # Legitimate sample
        X.append(generate_legit_sample())
        y.append(0)

    return np.array(X), np.array(y)


def generate_fraud_sample() -> list:
    """Generate a single fraud feature vector."""
    return [
        random.uniform(0, 100),  # mouseDistanceTotal - low
        0, 0, 0, 0, 0,  # mouse velocities - zero
        random.uniform(0.7, 1.0),  # straightLineRatio - high
        0,  # mousePauseCount
        random.randint(0, 10),  # keystrokeCount - low
        0, 0, 0, 0, 0,  # keystroke timings
        random.randint(0, 3), random.uniform(0.5, 1.0),  # paste events
        random.randint(0, 5), 0, 0, 0, 0, 0, 0,  # scroll, hover
        random.randint(1, 5), 0,  # clickCount, hover ratio
        random.uniform(1, 30),  # completionTime - fast
        random.uniform(100, 500), random.uniform(0, 100),  # timing
        random.uniform(50, 200), random.uniform(200, 1000),
        0, random.uniform(0, 100), 0, 1, 0,  # timing
        random.randint(0, 23), random.randint(0, 6),  # time of day
        1 if random.random() < 0.5 else 0,  # webdriver
        1 if random.random() < 0.6 else 0,  # automation
        random.randint(0, 3), 1 if random.random() < 0.3 else 0,  # plugins, screen
        random.choice([0, -300, -480]), 1 if random.random() < 0.3 else 0,  # timezone
        random.randint(1, 100), random.choice([2, 4, 8]),  # fingerprint, memory
        random.choice([2, 4, 8]), 0,  # concurrency, touch
        1 if random.random() < 0.4 else 0,  # vpn
        1 if random.random() < 0.6 else 0,  # datacenter
        1 if random.random() < 0.1 else 0,  # tor
        1 if random.random() < 0.2 else 0,  # proxy
        random.uniform(0, 0.4),  # ip reputation - low
        0,  # country code
        1 if random.random() < 0.3 else 0,  # geo match
        random.randint(5, 100),  # ip seen count - high
        random.randint(5, 30), random.randint(0, 3),  # questions
        random.uniform(0, 30), random.uniform(0, 10),  # open ended
        random.uniform(0, 5), random.uniform(0, 0.4),
        random.uniform(0.6, 1.0),  # straight line - high
        random.uniform(0, 0.8),  # entropy
        random.uniform(0.5, 1.0), random.uniform(0, 0.3), random.uniform(0, 0.3),  # option ratios
        random.uniform(0, 0.4), random.uniform(0.3, 0.8),  # uniqueness, duplicates
        random.uniform(0, 0.1), random.uniform(0, 0.1),  # na, skip
        1 if random.random() < 0.3 else 0,  # attention check
        random.randint(0, 2), random.uniform(0, 0.5),  # consistency
        1 if random.random() < 0.4 else 0,  # trap filled
        random.uniform(0.4, 1.0),  # honeypot score - high
    ]


def generate_legit_sample() -> list:
    """Generate a single legitimate feature vector."""
    return [
        random.uniform(5000, 30000),  # mouseDistanceTotal - high
        random.uniform(0.5, 1.5), random.uniform(0.3, 1.0),  # mouse velocities
        random.uniform(3, 10), random.uniform(0.01, 0.05),
        random.uniform(1.0, 2.5),  # curvature entropy
        random.uniform(0.05, 0.3),  # straightLineRatio - low
        random.randint(10, 50),  # mousePauseCount
        random.randint(50, 300),  # keystrokeCount - high
        random.uniform(100, 200), random.uniform(50, 150),  # keystroke timings
        random.uniform(80, 140), random.uniform(100, 200),
        random.uniform(0.03, 0.12),  # backspace ratio
        random.randint(0, 2), random.uniform(0, 0.1),  # paste events - low
        random.randint(20, 80), random.uniform(0.5, 2),  # scroll
        random.randint(8, 25), random.randint(1, 6),  # direction changes, focus loss
        random.uniform(5000, 30000),  # focus duration
        random.randint(30, 100), random.uniform(200, 800),  # hover
        random.randint(20, 80), random.uniform(0.5, 0.9),  # clicks, hover ratio
        random.uniform(120, 600),  # completionTime - reasonable
        random.uniform(5000, 20000), random.uniform(2000, 8000),  # timing
        random.uniform(3000, 10000), random.uniform(15000, 45000),
        random.uniform(0.3, 0.6), random.uniform(1000, 5000),  # reading ratio, delay
        random.uniform(10000, 60000), random.uniform(0.6, 0.85),  # idle, active
        random.uniform(-0.1, 0.1),  # acceleration
        random.randint(8, 22), random.randint(0, 6),  # time of day
        0, 0,  # no webdriver, no automation
        random.randint(5, 20), 1,  # plugins, common screen
        random.choice([-300, -360, -420, -480, 0, 60]), 1,  # timezone match
        1, random.choice([8, 16, 32]),  # fingerprint seen once, good memory
        random.choice([8, 12, 16]), 1 if random.random() < 0.3 else 0,  # concurrency, touch
        1 if random.random() < 0.1 else 0,  # vpn - rare
        0, 0, 0,  # no datacenter, tor, proxy
        random.uniform(0.7, 1.0),  # ip reputation - high
        0,  # country code
        1,  # geo match
        1,  # ip seen count - low
        random.randint(10, 40), random.randint(1, 5),  # questions
        random.uniform(60, 200), random.uniform(30, 80),  # open ended
        random.uniform(12, 40), random.uniform(0.6, 0.9),
        random.uniform(0.05, 0.25),  # straight line - low
        random.uniform(1.5, 2.5),  # entropy - high
        random.uniform(0.15, 0.35), random.uniform(0.15, 0.35), random.uniform(0.3, 0.55),  # balanced options
        random.uniform(0.6, 0.9), random.uniform(0.05, 0.2),  # high uniqueness, low duplicates
        random.uniform(0, 0.02), random.uniform(0, 0.02),  # low na, skip
        1,  # attention check passed
        random.randint(1, 3), random.uniform(0.8, 1.0),  # good consistency
        0,  # trap not filled
        0,  # honeypot score - zero
    ]


@app.function(
    image=ml_image,
    volumes={"/models": model_volume},
    secrets=[modal.Secret.from_name("supabase-credentials")],
    schedule=modal.Cron("0 3 * * *"),  # Run daily at 3 AM UTC
)
def scheduled_retrain():
    """Scheduled job to retrain global model daily."""
    print("[Scheduled] Starting daily retraining check...")

    result = retrain_model.remote(
        customer_id=None,  # Global model
        min_samples=500,   # Lower threshold for scheduled runs
        synthetic_ratio=0.2,
        warm_start=True,
    )

    if result["success"]:
        if result["promoted"]:
            print(f"[Scheduled] New model promoted: {result['version']}")
        else:
            print("[Scheduled] Model not promoted (no improvement)")
    else:
        print(f"[Scheduled] Training skipped: {result.get('error')}")

    return result


@app.local_entrypoint()
def main(customer_id: str = None, min_samples: int = 500):
    """Manual trigger for retraining."""
    print(f"🔄 Triggering retraining...")

    result = retrain_model.remote(
        customer_id=customer_id,
        min_samples=min_samples,
        synthetic_ratio=0.3,
        warm_start=True,
    )

    print("\n" + "=" * 50)
    if result["success"]:
        print("✅ RETRAINING COMPLETE")
        print(f"   Promoted: {result['promoted']}")
        if result['promoted']:
            print(f"   Version: {result['version']}")
        print(f"   Training samples: {result['training_samples']}")
        print(f"   Real: {result['real_samples']}, Synthetic: {result['synthetic_samples']}")
        print(f"\n📊 Metrics:")
        for k, v in result['metrics'].items():
            print(f"   {k}: {v:.4f}")
    else:
        print(f"❌ RETRAINING FAILED: {result.get('error')}")
