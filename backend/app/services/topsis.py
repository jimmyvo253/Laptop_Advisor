import numpy as np
from typing import List

# Criteria: [Performance, Resolution, Capacity, Portability, Battery, Price]
# 1: benefit, 0: cost
CRITERIA_TYPES = np.array([1, 1, 1, 1, 1, 0])

def calculate_topsis(weights: List[float], decision_matrix: np.ndarray) -> List[float]:
    W = np.array(weights)
    X = decision_matrix
    
    # Step 1: Normalize
    # Handle division by zero if all values in a column are 0
    norm = np.sqrt((X**2).sum(axis=0))
    norm[norm == 0] = 1.0 
    R = X / norm
    
    # Step 2: Weighted Normalize
    V = R * W
    
    # Step 3: Ideal best & worst
    ideal_best = np.zeros(V.shape[1])
    ideal_worst = np.zeros(V.shape[1])
    
    for j in range(V.shape[1]):
        if CRITERIA_TYPES[j] == 1:
            ideal_best[j] = np.max(V[:, j])
            ideal_worst[j] = np.min(V[:, j])
        else:
            ideal_best[j] = np.min(V[:, j])
            ideal_worst[j] = np.max(V[:, j])
            
    # Step 4: Distance
    dist_best = np.sqrt(((V - ideal_best)**2).sum(axis=1))
    dist_worst = np.sqrt(((V - ideal_worst)**2).sum(axis=1))
    
    # Step 5: Score
    scores = dist_worst / (dist_best + dist_worst)
    # Replace NaN with 0 if both distances are 0
    scores = np.nan_to_num(scores)
    
    return scores.tolist()
