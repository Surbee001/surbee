#!/usr/bin/env python3
"""
Train Cipher ML with 1 Million Samples

Generates synthetic data directly on Modal to avoid large file transfers.
"""

import modal
import json
import random
import math
from datetime import datetime, timezone

app = modal.App("cipher-ml-training")

ml_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "xgboost==2.0.3",
        "scikit-learn==1.4.0",
        "numpy==1.26.3",
    )
)

model_volume = modal.Volume.from_name("cipher-ml-models", create_if_missing=True)

# Feature names (must match TypeScript)
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

FEATURE_DISPLAY_NAMES = {
    'straightLineRatio': 'Answer Straight-lining',
    'honeypotScore': 'Honeypot Failures',
    'mouseDistanceTotal': 'Mouse Distance',
    'mouseVelocityMean': 'Mouse Speed',
    'keystrokeTimingMean': 'Typing Speed',
    'completionTimeSeconds': 'Completion Time',
    'hasWebdriver': 'Automation Detected',
    'isDatacenter': 'Datacenter IP',
    'answerEntropy': 'Answer Diversity',
}


def rb(min_v, max_v):
    """Random between min and max."""
    return random.random() * (max_v - min_v) + min_v


def ri(min_v, max_v):
    """Random integer."""
    return random.randint(min_v, max_v)


def rc(arr):
    """Random choice."""
    return random.choice(arr)


def log_normal(median, sigma=0.5):
    """Log-normal distribution."""
    u1 = random.random()
    u2 = random.random()
    z = math.sqrt(-2 * math.log(max(u1, 1e-10))) * math.cos(2 * math.pi * u2)
    return median * math.exp(sigma * z)


def get_survey_config(length):
    """Get survey configuration."""
    configs = {
        'short': {'q': ri(5, 10), 'oe': ri(1, 2), 'time': (0.5, 3)},
        'medium': {'q': ri(15, 25), 'oe': ri(2, 4), 'time': (2, 8)},
        'long': {'q': ri(30, 50), 'oe': ri(3, 6), 'time': (5, 20)},
    }
    return configs[length]


def generate_pure_bot(length):
    """Pure bot - zero interaction."""
    cfg = get_survey_config(length)
    ct = rb(1, 15)
    return [
        rb(0, 10), 0, 0, 0, 0, 0, 1 if random.random() < 0.3 else 0, 0,  # mouse
        ri(0, 5), 0, 0, 0, 0, 0, ri(0, 2), rb(0.8, 1) if random.random() < 0.2 else 0,  # keys
        ri(0, 3), 0, 0, 0, 0, 0, 0, cfg['q'], 0,  # scroll, hover, click
        ct, ct * 1000 / cfg['q'], rb(0, 100), ct * 800 / cfg['q'], ct * 1200 / cfg['q'],  # timing
        0, rb(0, 100), 0, 1, 0, ri(0, 23), ri(0, 6),  # more timing
        1 if random.random() < 0.8 else 0, 1 if random.random() < 0.9 else 0, ri(0, 2), 1 if random.random() < 0.3 else 0,  # device
        rc([0, -300, -480, 330]), 1 if random.random() < 0.3 else 0, ri(1, 100), rc([0, 2, 4]), rc([1, 2, 4]), 0,  # device
        1 if random.random() < 0.4 else 0, 1 if random.random() < 0.7 else 0, 1 if random.random() < 0.1 else 0, 1 if random.random() < 0.3 else 0,  # network
        rb(0, 0.3), 0, 1 if random.random() < 0.2 else 0, ri(5, 100),  # network
        cfg['q'], cfg['oe'], rb(0, 20), rb(0, 5), rb(0, 5), rb(0, 0.3),  # content
        rb(0.7, 1), rb(0, 0.5), rb(0.6, 1), rb(0, 0.2), rb(0, 0.2),  # content
        rb(0, 0.3), rb(0.5, 1), rb(0, 0.1), rb(0, 0.1),  # content
        1 if random.random() < 0.2 else 0, ri(0, 2), rb(0, 0.4), 1 if random.random() < 0.6 else 0, rb(0.5, 1),  # honeypot
    ]


def generate_script_bot(length):
    """Script bot - mechanical patterns."""
    cfg = get_survey_config(length)
    ct = rb(10, 45)
    return [
        rb(100, 1000), rb(0.5, 1.5), rb(0, 0.2), rb(1, 3), rb(0, 0.01), rb(0, 0.3), rb(0.7, 1), ri(0, 3),
        ri(10, 50), rb(50, 100), rb(0, 20), rb(50, 80), rb(50, 100), 0, ri(0, 3), rb(0, 0.3),
        ri(5, 20), rb(1, 3), ri(0, 3), 0, 0, ri(0, 10), rb(0, 100), cfg['q'] + ri(0, 5), rb(0, 0.2),
        ct, ct * 1000 / cfg['q'], rb(50, 300), ct * 900 / cfg['q'], ct * 1100 / cfg['q'],
        rb(0, 0.2), rb(100, 500), rb(0, 2000), rb(0.9, 1), rb(-0.1, 0.1), ri(0, 23), ri(0, 6),
        1 if random.random() < 0.5 else 0, 1 if random.random() < 0.6 else 0, ri(0, 5), 1 if random.random() < 0.5 else 0,
        rc([0, -300, -480, 330, -420]), 1 if random.random() < 0.4 else 0, ri(1, 50), rc([2, 4, 8]), rc([2, 4, 8]), 0,
        1 if random.random() < 0.5 else 0, 1 if random.random() < 0.5 else 0, 1 if random.random() < 0.05 else 0, 1 if random.random() < 0.3 else 0,
        rb(0.1, 0.5), 0, 1 if random.random() < 0.4 else 0, ri(3, 50),
        cfg['q'], cfg['oe'], rb(10, 50), rb(0, 10), rb(2, 10), rb(0.2, 0.5),
        rb(0.5, 0.9), rb(0.3, 1), rb(0.4, 0.8), rb(0, 0.3), rb(0.1, 0.3),
        rb(0.1, 0.4), rb(0.3, 0.7), rb(0, 0.1), rb(0, 0.05),
        1 if random.random() < 0.4 else 0, ri(0, 2), rb(0.2, 0.6), 1 if random.random() < 0.3 else 0, rb(0.3, 0.7),
    ]


def generate_speed_runner(length):
    """Speed runner - very fast but some human traits."""
    cfg = get_survey_config(length)
    ct = rb(15, 60)
    return [
        rb(500, 2000), rb(1, 3), rb(0.2, 0.6), rb(3, 8), rb(0.01, 0.03), rb(0.2, 0.6), rb(0.4, 0.7), ri(1, 5),
        ri(20, 80), rb(80, 150), rb(10, 40), rb(60, 100), rb(80, 150), rb(0, 0.02), ri(0, 2), rb(0, 0.2),
        ri(5, 25), rb(2, 5), ri(1, 5), ri(0, 2), rb(0, 5000), ri(5, 20), rb(50, 200), cfg['q'] + ri(2, 10), rb(0.1, 0.4),
        ct, ct * 1000 / cfg['q'], rb(200, 800), rb(500, 1500), rb(3000, 8000),
        rb(0.1, 0.3), rb(200, 1000), rb(0, 5000), rb(0.85, 0.98), rb(0, 0.3), ri(0, 23), ri(0, 6),
        1 if random.random() < 0.1 else 0, 1 if random.random() < 0.15 else 0, ri(2, 10), 1 if random.random() < 0.7 else 0,
        rc([-300, -360, -420, -480, 0, 60]), 1 if random.random() < 0.6 else 0, ri(1, 20), rc([4, 8, 16]), rc([4, 8, 12]), 1 if random.random() < 0.2 else 0,
        1 if random.random() < 0.3 else 0, 1 if random.random() < 0.2 else 0, 1 if random.random() < 0.02 else 0, 1 if random.random() < 0.15 else 0,
        rb(0.3, 0.6), 0, 1 if random.random() < 0.5 else 0, ri(1, 30),
        cfg['q'], cfg['oe'], rb(15, 40), rb(5, 15), rb(3, 8), rb(0.3, 0.6),
        rb(0.4, 0.7), rb(0.5, 1.2), rb(0.3, 0.6), rb(0.1, 0.3), rb(0.2, 0.4),
        rb(0.2, 0.5), rb(0.2, 0.5), rb(0, 0.05), rb(0, 0.05),
        1 if random.random() < 0.5 else 0, ri(0, 2), rb(0.3, 0.7), 1 if random.random() < 0.15 else 0, rb(0.2, 0.5),
    ]


def generate_straight_liner(length):
    """Straight-liner - same options repeatedly."""
    cfg = get_survey_config(length)
    ct = rb(30, 120)
    pattern = rc(['first', 'last', 'alt'])
    return [
        rb(1000, 5000), rb(0.8, 2), rb(0.3, 0.8), rb(3, 7), rb(0.01, 0.04), rb(0.3, 0.8), rb(0.3, 0.6), ri(2, 10),
        ri(30, 100), rb(100, 200), rb(30, 80), rb(80, 130), rb(100, 180), rb(0, 0.03), ri(0, 3), rb(0, 0.3),
        ri(10, 40), rb(1, 4), ri(2, 8), ri(0, 3), rb(0, 10000), ri(10, 40), rb(100, 400), cfg['q'] + ri(5, 15), rb(0.2, 0.5),
        ct, ct * 1000 / cfg['q'], rb(300, 1000), rb(800, 2000), rb(5000, 15000),
        rb(0.2, 0.4), rb(500, 2000), rb(0, 10000), rb(0.75, 0.95), rb(0.1, 0.4), ri(0, 23), ri(0, 6),
        1 if random.random() < 0.05 else 0, 1 if random.random() < 0.08 else 0, ri(3, 12), 1 if random.random() < 0.8 else 0,
        rc([-300, -360, -420, -480, 0, 60, 330]), 1 if random.random() < 0.7 else 0, ri(1, 15), rc([4, 8, 16]), rc([4, 8, 12, 16]), 1 if random.random() < 0.3 else 0,
        1 if random.random() < 0.25 else 0, 1 if random.random() < 0.1 else 0, 1 if random.random() < 0.01 else 0, 1 if random.random() < 0.1 else 0,
        rb(0.4, 0.7), 0, 1 if random.random() < 0.65 else 0, ri(1, 20),
        cfg['q'], cfg['oe'], rb(20, 60), rb(5, 20), rb(4, 12), rb(0.3, 0.6),
        rb(0.7, 1), rb(0.2, 0.8), rb(0.7, 1) if pattern == 'first' else rb(0.1, 0.3), rb(0.7, 1) if pattern == 'last' else rb(0.1, 0.3), rb(0.1, 0.3),
        rb(0.1, 0.4), rb(0.5, 0.9), rb(0, 0.05), rb(0, 0.05),
        1 if random.random() < 0.4 else 0, ri(0, 2), rb(0.2, 0.6), 1 if random.random() < 0.1 else 0, rb(0.2, 0.5),
    ]


def generate_copy_paste_farm(length):
    """Copy-paste farm - high paste events."""
    cfg = get_survey_config(length)
    ct = rb(60, 180)
    return [
        rb(2000, 8000), rb(0.8, 1.8), rb(0.4, 1), rb(3, 8), rb(0.02, 0.05), rb(0.4, 1), rb(0.2, 0.5), ri(5, 20),
        ri(20, 60), rb(100, 200), rb(40, 100), rb(90, 150), rb(100, 200), rb(0, 0.02), ri(5, 15), rb(0.5, 0.9),
        ri(10, 50), rb(1, 3), ri(3, 12), ri(2, 10), rb(5000, 30000), ri(15, 50), rb(150, 500), cfg['q'] + ri(10, 30), rb(0.3, 0.6),
        ct, ct * 1000 / cfg['q'], rb(500, 2000), rb(1000, 3000), rb(8000, 20000),
        rb(0.2, 0.4), rb(1000, 3000), rb(5000, 20000), rb(0.6, 0.85), rb(-0.1, 0.2), ri(0, 23), ri(0, 6),
        1 if random.random() < 0.05 else 0, 1 if random.random() < 0.08 else 0, ri(3, 15), 1 if random.random() < 0.75 else 0,
        rc([-300, -360, 0, 330, 480]), 1 if random.random() < 0.5 else 0, ri(1, 30), rc([4, 8]), rc([4, 8]), 1 if random.random() < 0.2 else 0,
        1 if random.random() < 0.4 else 0, 1 if random.random() < 0.15 else 0, 1 if random.random() < 0.02 else 0, 1 if random.random() < 0.2 else 0,
        rb(0.3, 0.6), 0, 1 if random.random() < 0.5 else 0, ri(2, 40),
        cfg['q'], cfg['oe'], rb(50, 200), rb(10, 30), rb(10, 40), rb(0.2, 0.5),
        rb(0.3, 0.6), rb(0.6, 1.2), rb(0.2, 0.4), rb(0.2, 0.4), rb(0.2, 0.4),
        rb(0.1, 0.4), rb(0.3, 0.6), rb(0, 0.05), rb(0, 0.03),
        1 if random.random() < 0.6 else 0, ri(0, 2), rb(0.4, 0.8), 1 if random.random() < 0.08 else 0, rb(0.1, 0.4),
    ]


def generate_datacenter_bot(length):
    """Datacenter bot - datacenter IP with suspicious behavior."""
    base = rc([generate_pure_bot, generate_script_bot, generate_speed_runner])(length)
    base[47] = 1  # isDatacenter = true
    base[46] = 1 if random.random() < 0.5 else 0  # isVpn
    base[50] = rb(0, 0.3)  # ipReputationScore low
    base[53] = ri(10, 100)  # ipSeenCount high
    base[52] = 1 if random.random() < 0.2 else 0  # geoTimezoneMatch
    return base


def generate_sophisticated_fraud(length):
    """Sophisticated fraud - almost human but subtle tells."""
    cfg = get_survey_config(length)
    min_t, max_t = cfg['time']
    ct = rb(min_t * 60 * 0.5, max_t * 60 * 0.7)
    return [
        rb(3000, 12000), rb(0.6, 1.5), rb(0.3, 0.7), rb(3, 7), rb(0.02, 0.05), rb(0.5, 1.2), rb(0.25, 0.45), ri(5, 20),
        ri(50, 200), rb(120, 200), rb(30, 70), rb(90, 140), rb(100, 180), rb(0.01, 0.04), ri(0, 3), rb(0, 0.2),
        ri(15, 60), rb(1, 3), ri(5, 15), ri(0, 4), rb(0, 15000), ri(20, 60), rb(150, 500), cfg['q'] + ri(10, 30), rb(0.4, 0.7),
        ct, ct * 1000 / cfg['q'], rb(800, 2500), rb(1500, 4000), rb(8000, 25000),
        rb(0.3, 0.5), rb(500, 2000), rb(2000, 15000), rb(0.75, 0.92), rb(0.05, 0.25), ri(0, 23), ri(0, 6),
        0, 0, ri(5, 15), 1 if random.random() < 0.85 else 0,
        rc([-300, -360, -420, -480, 0, 60]), 1 if random.random() < 0.7 else 0, ri(1, 10), rc([8, 16]), rc([8, 12, 16]), 1 if random.random() < 0.25 else 0,
        1 if random.random() < 0.35 else 0, 1 if random.random() < 0.15 else 0, 0, 1 if random.random() < 0.1 else 0,
        rb(0.4, 0.7), 0, 1 if random.random() < 0.6 else 0, ri(1, 15),
        cfg['q'], cfg['oe'], rb(40, 120), rb(15, 40), rb(8, 25), rb(0.4, 0.7),
        rb(0.35, 0.55), rb(0.8, 1.5), rb(0.25, 0.45), rb(0.15, 0.35), rb(0.25, 0.45),
        rb(0.3, 0.6), rb(0.2, 0.4), rb(0, 0.03), rb(0, 0.02),
        1 if random.random() < 0.75 else 0, ri(0, 2), rb(0.5, 0.85), 0, rb(0.05, 0.25),
    ]


def generate_thoughtful_desktop(length):
    """Thoughtful desktop user - careful, engaged."""
    cfg = get_survey_config(length)
    min_t, max_t = cfg['time']
    ct = rb(min_t * 60, max_t * 60)
    return [
        rb(8000, 30000), rb(0.5, 1.2), rb(0.4, 1.0), rb(3, 8), rb(0.02, 0.06), rb(1.0, 2.5), rb(0.1, 0.3), ri(10, 40),
        ri(100, 400), log_normal(150, 0.4), rb(50, 150), log_normal(100, 0.3), log_normal(130, 0.4), rb(0.03, 0.12), ri(0, 2), rb(0, 0.1),
        ri(20, 80), rb(0.5, 2), ri(8, 25), ri(1, 6), rb(5000, 30000), ri(30, 100), rb(200, 800), cfg['q'] + ri(15, 50), rb(0.5, 0.85),
        ct, ct * 1000 / cfg['q'], rb(3000, 10000), rb(3000, 8000), rb(15000, 45000),
        rb(0.4, 0.7), rb(1000, 5000), rb(10000, 60000), rb(0.6, 0.85), rb(-0.15, 0.15), ri(8, 22), ri(0, 6),
        0, 0, ri(5, 20), 1,
        rc([-300, -360, -420, -480, 0, 60, -240]), 1, 1, rc([8, 16, 32]), rc([8, 12, 16, 20]), 0,
        1 if random.random() < 0.1 else 0, 0, 0, 0,
        rb(0.7, 1), 0, 1, 1,
        cfg['q'], cfg['oe'], rb(60, 200), rb(30, 80), rb(12, 40), rb(0.6, 0.85),
        rb(0.05, 0.25), rb(1.5, 2.5), rb(0.15, 0.35), rb(0.15, 0.35), rb(0.3, 0.55),
        rb(0.6, 0.9), rb(0.05, 0.2), rb(0, 0.02), rb(0, 0.02),
        1, ri(1, 3), rb(0.8, 1), 0, 0,
    ]


def generate_mobile_user(length):
    """Mobile user - touch patterns."""
    cfg = get_survey_config(length)
    min_t, max_t = cfg['time']
    ct = rb(min_t * 60 * 0.8, max_t * 60 * 1.2)
    return [
        rb(2000, 8000), rb(0.3, 0.8), rb(0.3, 0.8), rb(2, 5), rb(0.01, 0.04), rb(0.5, 1.5), rb(0.2, 0.5), ri(5, 25),
        ri(50, 250), log_normal(200, 0.5), rb(80, 200), log_normal(120, 0.4), log_normal(180, 0.5), rb(0.05, 0.15), ri(0, 1), rb(0, 0.05),
        ri(30, 120), rb(1, 4), ri(10, 35), ri(2, 10), rb(10000, 60000), ri(5, 20), rb(50, 200), cfg['q'] + ri(10, 40), rb(0.1, 0.3),
        ct, ct * 1000 / cfg['q'], rb(4000, 12000), rb(2000, 6000), rb(20000, 50000),
        rb(0.35, 0.6), rb(1500, 6000), rb(15000, 80000), rb(0.5, 0.8), rb(-0.1, 0.2), ri(6, 23), ri(0, 6),
        0, 0, ri(0, 5), 1,
        rc([-300, -360, -420, -480, 0, 60, 330]), 1 if random.random() < 0.9 else 0, 1, rc([3, 4, 6, 8]), rc([4, 6, 8]), 1,
        1 if random.random() < 0.05 else 0, 0, 0, 0,
        rb(0.7, 1), 0, 1 if random.random() < 0.85 else 0, 1,
        cfg['q'], cfg['oe'], rb(40, 120), rb(20, 50), rb(8, 25), rb(0.55, 0.8),
        rb(0.1, 0.3), rb(1.3, 2.3), rb(0.15, 0.35), rb(0.15, 0.35), rb(0.3, 0.5),
        rb(0.55, 0.85), rb(0.08, 0.25), rb(0, 0.03), rb(0, 0.03),
        1 if random.random() < 0.95 else 0, ri(1, 3), rb(0.75, 1), 0, 0,
    ]


def generate_fast_genuine(length):
    """Fast but genuine - quick typist."""
    cfg = get_survey_config(length)
    min_t, _ = cfg['time']
    ct = rb(min_t * 60 * 0.4, min_t * 60 * 0.8)
    return [
        rb(5000, 15000), rb(0.8, 1.8), rb(0.5, 1.2), rb(4, 10), rb(0.03, 0.08), rb(0.8, 2), rb(0.15, 0.35), ri(5, 20),
        ri(80, 250), log_normal(100, 0.4), rb(40, 100), log_normal(70, 0.3), log_normal(90, 0.4), rb(0.02, 0.08), ri(0, 2), rb(0, 0.1),
        ri(15, 50), rb(1.5, 4), ri(5, 18), ri(0, 3), rb(0, 15000), ri(20, 60), rb(100, 400), cfg['q'] + ri(10, 35), rb(0.4, 0.7),
        ct, ct * 1000 / cfg['q'], rb(2000, 6000), rb(1500, 4000), rb(8000, 20000),
        rb(0.25, 0.45), rb(500, 2000), rb(2000, 20000), rb(0.75, 0.95), rb(-0.1, 0.1), ri(8, 22), ri(0, 6),
        0, 0, ri(5, 18), 1,
        rc([-300, -360, -420, -480, 0, 60]), 1, 1, rc([8, 16, 32]), rc([8, 12, 16]), 1 if random.random() < 0.15 else 0,
        1 if random.random() < 0.08 else 0, 0, 0, 0,
        rb(0.75, 1), 0, 1, 1,
        cfg['q'], cfg['oe'], rb(40, 100), rb(20, 50), rb(8, 20), rb(0.55, 0.8),
        rb(0.1, 0.3), rb(1.4, 2.2), rb(0.18, 0.38), rb(0.15, 0.35), rb(0.3, 0.5),
        rb(0.55, 0.85), rb(0.1, 0.25), rb(0, 0.02), rb(0, 0.02),
        1, ri(1, 3), rb(0.8, 1), 0, 0,
    ]


def generate_slow_careful(length):
    """Slow/careful reader - very engaged."""
    cfg = get_survey_config(length)
    _, max_t = cfg['time']
    ct = rb(max_t * 60, max_t * 60 * 1.8)
    return [
        rb(15000, 50000), rb(0.3, 0.8), rb(0.3, 0.7), rb(2, 5), rb(0.01, 0.03), rb(1.2, 2.8), rb(0.08, 0.22), ri(20, 60),
        ri(150, 500), log_normal(200, 0.5), rb(80, 200), log_normal(130, 0.4), log_normal(180, 0.5), rb(0.05, 0.15), ri(0, 2), rb(0, 0.08),
        ri(40, 120), rb(0.3, 1.2), ri(15, 40), ri(2, 8), rb(20000, 90000), ri(50, 150), rb(300, 1200), cfg['q'] + ri(20, 60), rb(0.6, 0.9),
        ct, ct * 1000 / cfg['q'], rb(5000, 15000), rb(5000, 12000), rb(30000, 90000),
        rb(0.5, 0.75), rb(3000, 10000), rb(30000, 120000), rb(0.5, 0.75), rb(-0.2, 0.05), ri(8, 22), ri(0, 6),
        0, 0, ri(5, 20), 1,
        rc([-300, -360, -420, -480, 0, 60]), 1, 1, rc([8, 16]), rc([4, 8, 12]), 1 if random.random() < 0.2 else 0,
        1 if random.random() < 0.08 else 0, 0, 0, 0,
        rb(0.8, 1), 0, 1, 1,
        cfg['q'], cfg['oe'], rb(100, 300), rb(40, 100), rb(20, 60), rb(0.65, 0.9),
        rb(0.03, 0.18), rb(1.8, 2.8), rb(0.12, 0.28), rb(0.12, 0.28), rb(0.4, 0.6),
        rb(0.7, 0.95), rb(0.02, 0.12), rb(0, 0.01), 0,
        1, ri(1, 3), rb(0.9, 1), 0, 0,
    ]


def generate_distracted_user(length):
    """Distracted user - tab switches, but completes."""
    cfg = get_survey_config(length)
    _, max_t = cfg['time']
    ct = rb(max_t * 60 * 0.8, max_t * 60 * 2)
    return [
        rb(8000, 25000), rb(0.5, 1.2), rb(0.4, 1), rb(3, 8), rb(0.02, 0.05), rb(0.9, 2.2), rb(0.12, 0.32), ri(15, 50),
        ri(100, 350), log_normal(160, 0.5), rb(60, 150), log_normal(110, 0.4), log_normal(150, 0.5), rb(0.04, 0.12), ri(0, 3), rb(0, 0.15),
        ri(25, 80), rb(0.8, 2.5), ri(10, 30), ri(5, 20), rb(30000, 180000), ri(30, 90), rb(200, 700), cfg['q'] + ri(15, 45), rb(0.45, 0.75),
        ct, ct * 1000 / cfg['q'], rb(5000, 20000), rb(2000, 6000), rb(30000, 120000),
        rb(0.3, 0.55), rb(2000, 8000), rb(40000, 150000), rb(0.4, 0.7), rb(-0.15, 0.15), ri(8, 23), ri(0, 6),
        0, 0, ri(8, 25), 1,
        rc([-300, -360, -420, -480, 0, 60]), 1, 1, rc([8, 16, 32]), rc([8, 12, 16]), 1 if random.random() < 0.15 else 0,
        1 if random.random() < 0.12 else 0, 0, 0, 0,
        rb(0.7, 1), 0, 1 if random.random() < 0.9 else 0, 1,
        cfg['q'], cfg['oe'], rb(50, 150), rb(25, 70), rb(10, 30), rb(0.55, 0.8),
        rb(0.08, 0.28), rb(1.4, 2.4), rb(0.15, 0.35), rb(0.15, 0.35), rb(0.3, 0.55),
        rb(0.55, 0.85), rb(0.08, 0.22), rb(0, 0.03), rb(0, 0.02),
        1 if random.random() < 0.92 else 0, ri(1, 3), rb(0.75, 0.95), 0, 0,
    ]


def generate_vpn_legitimate(length):
    """VPN legitimate - uses VPN but real user."""
    base = rc([generate_thoughtful_desktop, generate_fast_genuine, generate_mobile_user])(length)
    base[46] = 1  # isVpn = true
    base[52] = 1 if random.random() < 0.4 else 0  # geoTimezoneMatch
    base[50] = rb(0.5, 0.8)  # ipReputationScore
    return base


def generate_edge_case(length):
    """Edge case - elderly, accessibility, non-native speakers."""
    cfg = get_survey_config(length)
    _, max_t = cfg['time']
    ct = rb(max_t * 60 * 1.5, max_t * 60 * 3)
    return [
        rb(10000, 40000), rb(0.2, 0.6), rb(0.2, 0.5), rb(1.5, 4), rb(0.005, 0.02), rb(0.8, 2), rb(0.15, 0.4), ri(20, 80),
        ri(80, 300), log_normal(300, 0.6), rb(100, 250), log_normal(180, 0.5), log_normal(280, 0.6), rb(0.08, 0.2), ri(0, 1), rb(0, 0.05),
        ri(30, 100), rb(0.2, 0.8), ri(10, 35), ri(1, 5), rb(10000, 50000), ri(40, 120), rb(400, 1500), cfg['q'] + ri(15, 50), rb(0.5, 0.85),
        ct, ct * 1000 / cfg['q'], rb(8000, 25000), rb(8000, 20000), rb(40000, 120000),
        rb(0.45, 0.7), rb(5000, 15000), rb(30000, 100000), rb(0.5, 0.75), rb(-0.1, 0.1), ri(8, 20), ri(0, 6),
        0, 0, ri(3, 12), 1,
        rc([-300, -360, -420, -480, 0, 60]), 1, 1, rc([4, 8]), rc([4, 8]), 1 if random.random() < 0.3 else 0,
        0, 0, 0, 0,
        rb(0.75, 1), 0, 1, 1,
        cfg['q'], cfg['oe'], rb(40, 120), rb(20, 60), rb(8, 25), rb(0.5, 0.75),
        rb(0.1, 0.3), rb(1.3, 2.2), rb(0.15, 0.35), rb(0.15, 0.35), rb(0.3, 0.55),
        rb(0.5, 0.8), rb(0.1, 0.25), rb(0, 0.05), rb(0, 0.03),
        1 if random.random() < 0.85 else 0, ri(1, 3), rb(0.7, 0.95), 0, 0,
    ]


# Generators with weights
FRAUD_GENS = [
    (generate_pure_bot, 'pure_bot', 10),
    (generate_script_bot, 'script_bot', 8),
    (generate_speed_runner, 'speed_runner', 8),
    (generate_straight_liner, 'straight_liner', 8),
    (generate_copy_paste_farm, 'copy_paste_farm', 6),
    (generate_datacenter_bot, 'datacenter_bot', 6),
    (generate_sophisticated_fraud, 'sophisticated_fraud', 4),
]

LEGIT_GENS = [
    (generate_thoughtful_desktop, 'thoughtful_desktop', 12),
    (generate_mobile_user, 'mobile_user', 10),
    (generate_fast_genuine, 'fast_genuine', 8),
    (generate_slow_careful, 'slow_careful', 8),
    (generate_distracted_user, 'distracted_user', 6),
    (generate_vpn_legitimate, 'vpn_legitimate', 4),
    (generate_edge_case, 'edge_case', 2),
]


def select_survey_length():
    r = random.random()
    if r < 0.3:
        return 'short'
    elif r < 0.8:
        return 'medium'
    return 'long'


@app.function(
    image=ml_image,
    volumes={"/models": model_volume},
    timeout=3600,
    cpu=8.0,
    memory=32768,
)
def generate_and_train(sample_count: int, model_version: str):
    """Generate synthetic data and train model - all on Modal."""
    import numpy as np
    import xgboost as xgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, classification_report
    import os

    print(f"[Cipher ML] Generating {sample_count:,} synthetic samples...")

    X = []
    y = []

    fraud_count = sample_count // 2
    legit_count = sample_count - fraud_count

    # Generate fraud
    fraud_total_weight = sum(w for _, _, w in FRAUD_GENS)
    for gen, name, weight in FRAUD_GENS:
        count = int((weight / fraud_total_weight) * fraud_count)
        print(f"  Generating {count:,} {name}...")
        for _ in range(count):
            length = select_survey_length()
            X.append(gen(length))
            y.append(1)

    # Generate legitimate
    legit_total_weight = sum(w for _, _, w in LEGIT_GENS)
    for gen, name, weight in LEGIT_GENS:
        count = int((weight / legit_total_weight) * legit_count)
        print(f"  Generating {count:,} {name}...")
        for _ in range(count):
            length = select_survey_length()
            X.append(gen(length))
            y.append(0)

    print(f"[Cipher ML] Generated {len(X):,} samples")

    # Convert to numpy
    X = np.array(X)
    y = np.array(y)

    # Shuffle
    indices = np.random.permutation(len(X))
    X = X[indices]
    y = y[indices]

    fraud_samples = int(np.sum(y == 1))
    legit_samples = int(np.sum(y == 0))
    print(f"[Cipher ML] Class distribution: {fraud_samples:,} fraud, {legit_samples:,} legitimate")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"[Cipher ML] Train: {len(X_train):,}, Test: {len(X_test):,}")

    # Train
    scale_pos_weight = legit_samples / fraud_samples if fraud_samples > 0 else 1

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

    print("[Cipher ML] Training XGBoost model...")
    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=True)

    # Evaluate
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]

    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_pred_proba)

    print(f"\n[Cipher ML] Results:")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall: {recall:.4f}")
    print(f"  F1 Score: {f1:.4f}")
    print(f"  AUC-ROC: {auc_roc:.4f}")
    print(f"\n{classification_report(y_test, y_pred, target_names=['Legitimate', 'Fraud'])}")

    cm = confusion_matrix(y_test, y_pred)
    print(f"[Cipher ML] Confusion Matrix:")
    print(f"  TN: {cm[0][0]:,}, FP: {cm[0][1]:,}")
    print(f"  FN: {cm[1][0]:,}, TP: {cm[1][1]:,}")

    # Feature importance
    importance = model.feature_importances_
    feature_importance = sorted(zip(FEATURE_NAMES, importance), key=lambda x: x[1], reverse=True)

    print(f"\n[Cipher ML] Top 15 Features:")
    for name, imp in feature_importance[:15]:
        display = FEATURE_DISPLAY_NAMES.get(name, name)
        print(f"  {display}: {imp:.4f}")

    # Save model
    model_dir = f"/models/{model_version}"
    os.makedirs(model_dir, exist_ok=True)

    model_path = f"{model_dir}/model.json"
    model.save_model(model_path)
    print(f"[Cipher ML] Model saved to {model_path}")

    # Save metadata
    metadata = {
        "version": model_version,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "feature_names": FEATURE_NAMES,
        "feature_count": len(FEATURE_NAMES),
        "training_samples": len(X),
        "fraud_samples": fraud_samples,
        "legitimate_samples": legit_samples,
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
    }

    with open(f"{model_dir}/metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    model_volume.commit()

    print(f"\n[Cipher ML] Training complete!")

    return {
        "success": True,
        "model_version": model_version,
        "metrics": metadata["metrics"],
        "training_samples": len(X),
        "fraud_samples": fraud_samples,
        "legitimate_samples": legit_samples,
        "confusion_matrix": metadata["confusion_matrix"],
        "top_features": [
            {"name": name, "display_name": FEATURE_DISPLAY_NAMES.get(name, name), "importance": float(imp)}
            for name, imp in feature_importance[:10]
        ],
    }


@app.local_entrypoint()
def main(samples: int = 1000000, version: str = "v2.0.0"):
    """Local entrypoint to trigger training."""
    print(f"🔐 Cipher ML Training - {samples:,} samples")
    print("=" * 50)
    result = generate_and_train.remote(samples, version)

    print("\n" + "=" * 50)
    print("✅ TRAINING COMPLETE")
    print("=" * 50)
    print(f"\nModel: {result['model_version']}")
    print(f"Samples: {result['training_samples']:,}")
    print(f"  Fraud: {result['fraud_samples']:,}")
    print(f"  Legitimate: {result['legitimate_samples']:,}")
    print(f"\n📊 Metrics:")
    print(f"  Precision: {result['metrics']['precision']*100:.2f}%")
    print(f"  Recall: {result['metrics']['recall']*100:.2f}%")
    print(f"  F1 Score: {result['metrics']['f1']*100:.2f}%")
    print(f"  AUC-ROC: {result['metrics']['auc_roc']*100:.2f}%")
    print(f"\n📈 Confusion Matrix:")
    cm = result['confusion_matrix']
    print(f"  True Negatives: {cm['tn']:,}")
    print(f"  False Positives: {cm['fp']:,}")
    print(f"  False Negatives: {cm['fn']:,}")
    print(f"  True Positives: {cm['tp']:,}")
    print(f"\n🎯 Top Features:")
    for feat in result['top_features']:
        print(f"  {feat['display_name']}: {feat['importance']*100:.2f}%")
