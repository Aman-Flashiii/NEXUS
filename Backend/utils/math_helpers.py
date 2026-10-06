import numpy as np
from typing import List

def min_max_normalize(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """Strictly normalizes a value between 0 and 100."""
    return max(min_val, min(max_val, value))

def calculate_z_score(value: float, mean: float, std: float) -> float:
    """Calculates the Z-score for cohort-relative segmentation."""
    if std == 0: return 0.0
    return (value - mean) / std

def exponential_decay(base_success: float, total_efficacy: float) -> float:
    """Models diminishing returns using exponential decay."""
    decay_factor = total_efficacy / 100.0
    return 100.0 - ((100.0 - base_success) * np.exp(-decay_factor))

def calculate_cusum(data: List[float], threshold: float = 4.0) -> dict:
    """Two-sided CUSUM for Statistical Process Control."""
    if len(data) < 4: return {"detected": False}
    mean, std = np.mean(data), np.std(data)
    if std == 0: return {"detected": False}
    
    cusum_pos, cusum_neg = 0.0, 0.0
    k = 0.5 * std 
    
    for i, val in enumerate(data):
        cusum_pos = max(0, cusum_pos + (val - mean) - k)
        cusum_neg = max(0, cusum_neg - (val - mean) - k)
        if cusum_pos > threshold or cusum_neg > threshold:
            return {"detected": True, "index": i, "max_cusum": max(cusum_pos, cusum_neg)}
            
    return {"detected": False}

    