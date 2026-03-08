import numpy as np
from typing import List, Tuple

CRITERIA = ["Performance", "Resolution", "Capacity", "Portability", "Battery", "Price"]

def calculate_ahp(comparisons: List[float]) -> Tuple[List[float], float]:
    n = len(CRITERIA)
    A = np.eye(n)
    
    idx = 0
    for i in range(n):
        for j in range(i + 1, n):
            if idx < len(comparisons):
                val = comparisons[idx]
                A[i, j] = val
                A[j, i] = 1.0 / val
                idx += 1
            
    # Calculate weights using Eigenvector method
    eigvals, eigvecs = np.linalg.eig(A)
    max_idx = np.argmax(eigvals.real)
    max_eigval = eigvals[max_idx].real
    weights = eigvecs[:, max_idx].real
    weights = weights / np.sum(weights)
    
    # Consistency Ratio
    RI = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49]
    CI = (max_eigval - n) / (n - 1) if n > 1 else 0
    CR = CI / RI[n-1] if n > 1 else 0
    
    return weights.tolist(), CR
