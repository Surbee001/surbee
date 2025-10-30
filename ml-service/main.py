from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
import joblib
import logging
from typing import List, Dict, Optional

app = FastAPI(title="Survey Fraud Detection API")

try:
  fraud_model = joblib.load('models/fraud_model.pkl')
  scaler = joblib.load('models/scaler.pkl')
except Exception:
  fraud_model = None
  scaler = None

class MouseMovement(BaseModel):
  x: float
  y: float
  timestamp: int
  velocity: Optional[float] = None

class KeystrokeEvent(BaseModel):
  key: str
  timestamp: int
  dwell_time: float
  flight_time: float

class BehavioralData(BaseModel):
  survey_id: str
  response_id: str
  mouse_movements: List[MouseMovement]
  keystrokes: List[KeystrokeEvent]
  response_times: List[float]
  scroll_events: List[Dict]
  device_fingerprint: Dict
  answer_patterns: List[str]

class FraudAnalysis(BaseModel):
  fraud_probability: float
  is_suspicious: bool
  risk_factors: List[str]
  confidence: float
  recommendations: List[str]

@app.post("/analyze-behavior")
async def analyze_behavior(data: BehavioralData):
  try:
    features = extract_comprehensive_features(data)
    if fraud_model is None or scaler is None:
      prob = float(min(1.0, max(0.0, np.mean(features) / 100.0)))
    else:
      features_norm = scaler.transform([features])
      prob = float(fraud_model.predict_proba(features_norm)[0][1])
    is_suspicious = prob > 0.7
    risk_factors = identify_risk_factors(data, features, prob)
    recommendations = generate_recommendations(risk_factors, prob)
    return {
      'fraud_probability': prob,
      'is_suspicious': is_suspicious,
      'risk_factors': risk_factors,
      'confidence': min(abs(prob - 0.5) * 2, 1.0),
      'recommendations': recommendations,
    }
  except Exception as e:
    logging.error(f"Fraud analysis failed: {e}")
    raise HTTPException(status_code=500, detail="Analysis failed")

def extract_comprehensive_features(data: BehavioralData) -> List[float]:
  features = []
  if data.mouse_movements:
    df = pd.DataFrame([m.dict() for m in data.mouse_movements])
    df['velocity'] = np.sqrt(df['x'].diff()**2 + df['y'].diff()**2) / df['timestamp'].diff()
    df['acceleration'] = df['velocity'].diff()
    features.extend([
      np.nanmean(df['velocity']),
      np.nanstd(df['velocity']),
      np.nanmean(df['acceleration']),
      np.nanstd(df['acceleration']),
      len(df),
      np.nanmax(df['velocity']),
    ])
  else:
    features.extend([0]*6)
  if data.keystrokes:
    kdf = pd.DataFrame([k.dict() for k in data.keystrokes])
    features.extend([
      np.nanmean(kdf['dwell_time']),
      np.nanstd(kdf['dwell_time']),
      np.nanmean(kdf['flight_time']),
      np.nanstd(kdf['flight_time']),
      len(kdf),
    ])
  else:
    features.extend([0]*5)
  if data.response_times:
    rt = np.array(data.response_times)
    features.extend([float(np.mean(rt)), float(np.std(rt)), float(np.min(rt)), float(np.max(rt)), int(np.sum(rt < 1.0))])
  else:
    features.extend([0]*5)
  if data.answer_patterns:
    ent = calculate_entropy(data.answer_patterns)
    consecutive = count_consecutive_same_answers(data.answer_patterns)
    features.extend([ent, consecutive, len(set(data.answer_patterns))/len(data.answer_patterns)])
  else:
    features.extend([0]*3)
  device = data.device_fingerprint
  features.extend([1 if device.get('is_mobile', False) else 0, len(device.get('plugins', [])), device.get('screen_width',0), device.get('screen_height',0), device.get('color_depth',0)])
  return [0 if (isinstance(x,float) and (np.isnan(x) or np.isinf(x))) else x for x in features]

def identify_risk_factors(data: BehavioralData, features: List[float], prob: float) -> List[str]:
  rf = []
  if data.response_times and np.mean(data.response_times) < 2.0:
    rf.append('Extremely fast response times')
  if data.mouse_movements and len(data.mouse_movements) > 10:
    velocities = [m.velocity for m in data.mouse_movements if m.velocity]
    if velocities and np.std(velocities) < 0.1:
      rf.append('Robotic mouse movement patterns')
  if data.answer_patterns:
    consecutive = count_consecutive_same_answers(data.answer_patterns)
    if consecutive > len(data.answer_patterns) * 0.5:
      rf.append('Repetitive answer patterns')
  if not data.mouse_movements:
    rf.append('No mouse movement data')
  if not data.keystrokes:
    rf.append('No keystroke data')
  return rf

def generate_recommendations(risk_factors: List[str], fraud_prob: float) -> List[str]:
  rec = []
  if fraud_prob > 0.9:
    rec.append('Reject response - very high fraud probability')
  elif fraud_prob > 0.7:
    rec.append('Flag for manual review')
  elif fraud_prob > 0.5:
    rec.append('Monitor user for patterns')
  if 'Extremely fast response times' in risk_factors:
    rec.append('Consider adding minimum time requirements')
  if 'Robotic mouse movement patterns' in risk_factors:
    rec.append('Implement additional bot detection measures')
  return rec

def calculate_entropy(answers: List[str]) -> float:
  from collections import Counter
  import math
  counts = Counter(answers)
  probs = [c/len(answers) for c in counts.values()]
  return -sum(p*math.log2(p) for p in probs if p>0)

def count_consecutive_same_answers(answers: List[str]) -> int:
  consecutive = 0
  streak = 1
  for i in range(1, len(answers)):
    if answers[i] == answers[i-1]:
      streak += 1
    else:
      consecutive = max(consecutive, streak)
      streak = 1
  return max(consecutive, streak)

@app.get('/health')
async def health():
  return { 'status': 'healthy', 'model_loaded': fraud_model is not None }

