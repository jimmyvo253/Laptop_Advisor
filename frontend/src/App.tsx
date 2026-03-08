import { useState, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import type { RankingResponse } from './types';

const CRITERIA = ["Performance", "Resolution", "Capacity", "Portability", "Battery", "Price"];

const SCALE_LABELS: Record<number, string> = {
  1: "Equal Importance",
  3: "Moderate Importance",
  5: "Strong Importance",
  7: "Very Strong Importance",
  9: "Extreme Importance"
};

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: string;
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || token === 'undefined') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function ComparisonTool() {
  const [matrix, setMatrix] = useState<number[][]>(() => {
    const m = Array(6).fill(0).map(() => Array(6).fill(1));
    return m;
  });
  const [results, setResults] = useState<RankingResponse | null>(null);
  const [step, setStep] = useState(0); 
  const [activePair, setActivePair] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  const updateMatrixValue = (i: number, j: number, val: number) => {
    const newMatrix = matrix.map(row => [...row]);
    newMatrix[i][j] = val;
    newMatrix[j][i] = 1 / val;
    setMatrix(newMatrix);
  };

  const calculate = async () => {
    setLoading(true);
    const flattened: number[] = [];
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) {
        flattened.push(matrix[i][j]);
      }
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/calculate`, {
        comparisons: flattened
      });
      setResults(response.data);
      setStep(2);
    } catch (error) {
      console.error("Error calculating:", error);
      alert("Error calculating rankings.");
    } finally {
      setLoading(false);
    }
  };

  const getSliderValue = (val: number) => {
    if (val >= 1) return val - 1;
    return -( (1/val) - 1 );
  };

  const fromSliderValue = (sliderVal: number) => {
    if (sliderVal >= 0) return sliderVal + 1;
    return 1 / (Math.abs(sliderVal) + 1);
  };

  const formatCellValue = (val: number) => {
    if (val === 1) return "1";
    if (val > 1) return val.toString();
    return `1/${Math.round(1/val)}`;
  };

  return (
    <>
      {step === 0 && (
        <div className="card welcome">
          <h2>Pairwise Comparison Matrix</h2>
          <p>Define how much you value one criterion over another using the Saaty Scale (1-9).</p>
          <button className="primary-btn" onClick={() => setStep(1)}>Open Matrix</button>
        </div>
      )}

      {step === 1 && (
        <div className="matrix-view">
          <div className="card matrix-card">
            <h3>Comparison Matrix</h3>
            <div className="table-wrapper">
              <table className="ahp-table">
                <thead>
                  <tr>
                    <th>Criteria</th>
                    {CRITERIA.map(c => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA.map((rowName, i) => (
                    <tr key={rowName}>
                      <td className="row-header">{rowName}</td>
                      {CRITERIA.map((_, j) => {
                        const isDiagonal = i === j;
                        const isLower = i > j;
                        return (
                          <td 
                            key={`${i}-${j}`} 
                            className={`matrix-cell ${isDiagonal ? 'diag' : ''} ${isLower ? 'lower' : 'upper'}`}
                            onClick={() => !isDiagonal && setActivePair([i, j])}
                          >
                            {formatCellValue(matrix[i][j])}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="matrix-actions">
              <button onClick={() => setStep(0)}>Back</button>
              <button className="primary-btn" onClick={calculate} disabled={loading}>
                {loading ? 'Processing...' : 'Calculate Rankings'}
              </button>
            </div>
          </div>

          {activePair && (
            <div className="modal-overlay" onClick={() => setActivePair(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Compare Importance</h3>
                <div className="comparison-names">
                  <span className={matrix[activePair[0]][activePair[1]] >= 1 ? 'active' : ''}>{CRITERIA[activePair[0]]}</span>
                  <span className="vs">vs</span>
                  <span className={matrix[activePair[0]][activePair[1]] < 1 ? 'active' : ''}>{CRITERIA[activePair[1]]}</span>
                </div>
                
                <input 
                  type="range" min="-8" max="8" step="1"
                  value={getSliderValue(matrix[activePair[0]][activePair[1]])}
                  onChange={(e) => updateMatrixValue(activePair[0], activePair[1], fromSliderValue(parseInt(e.target.value)))}
                  className="slider"
                />
                
                <div className="slider-value-display">
                  {matrix[activePair[0]][activePair[1]] >= 1 
                    ? `${matrix[activePair[0]][activePair[1]]}x more important`
                    : `1/${Math.round(1/matrix[activePair[0]][activePair[1]])}x as important`
                  }
                </div>
                
                <p className="hint">
                  {SCALE_LABELS[Math.round(matrix[activePair[0]][activePair[1]] >= 1 ? matrix[activePair[0]][activePair[1]] : 1/matrix[activePair[0]][activePair[1]])]}
                </p>
                
                <button className="primary-btn" onClick={() => setActivePair(null)}>Done</button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && results && (
        <div className="results-container">
          <div className="card ranking-card">
            <h2>Recommended Laptops</h2>
            <div className="ranking-list">
              {results.ranking.map((item, idx) => (
                <div key={item.name} className="ranking-item">
                  <div className="rank">#{idx + 1}</div>
                  <div className="laptop-info">
                    <span className="laptop-name">{item.name}</span>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${item.score * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="score-val">{(item.score * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="side-cards">
            <div className="card stats-card">
              <h3>Computed Weights</h3>
              <div className="weights-list">
                {Object.entries(results.weights)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, weight]) => (
                    <div key={name} className="weight-item">
                      <span>{name}</span>
                      <span>{(weight * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="card info-card">
              <h3>Consistency Ratio</h3>
              <p className={results.cr < 0.1 ? 'text-success' : 'text-warning'}>
                CR: {results.cr.toFixed(4)}
              </p>
              <small>{results.cr < 0.1 ? "Valid consistency." : "Consider reviewing your comparisons."}</small>
              <button className="secondary-btn" style={{marginTop: '1rem'}} onClick={() => setStep(1)}>Edit Matrix</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface MainLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  token: string | null;
  role: string | null;
}

function MainLayout({ children, onLogout, token, role }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if user is admin
  const isAdmin = token && role && (role.toLowerCase() === 'admin');
  const isLoggedIn = !!token && token !== 'undefined';

  return (
    <div className="container">
      <header className="app-header">
        <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>
          <h1>Laptop Selection Advisor</h1>
          <p>AHP + TOPSIS Matrix Decision System</p>
        </Link>
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              {isAdmin && location.pathname !== '/admin' && (
                <button 
                  className="secondary-btn" 
                  onClick={() => navigate('/admin')} 
                  style={{ backgroundColor: '#eef2ff', fontWeight: 'bold' }}
                >
                  Admin Dashboard
                </button>
              )}
              <button className="secondary-btn" onClick={onLogout}>Logout</button>
            </>
          ) : (
            location.pathname !== '/login' && (
              <button className="secondary-btn" onClick={() => navigate('/login')}>Admin Login</button>
            )
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function App() {
  const getStoredToken = () => {
    const t = localStorage.getItem('token');
    return (t === 'undefined' || !t) ? null : t;
  };

  const getStoredRole = () => {
    const r = localStorage.getItem('role');
    return (r === 'undefined' || !r) ? null : r;
  };

  const [authToken, setAuthToken] = useState<string | null>(getStoredToken());
  const [authRole, setAuthRole] = useState<string | null>(getStoredRole());

  const handleLogin = (token: string, role: string) => {
    if (!token || !role) {
      console.error("Invalid login data received", { token, role });
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setAuthToken(token);
    setAuthRole(role);
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthToken(null);
    setAuthRole(null);
  };

  return (
    <Router>
      <MainLayout onLogout={handleLogout} token={authToken} role={authRole}>
        <Routes>
          <Route path="/" element={<ComparisonTool />} />
          <Route path="/login" element={
            authToken ? <Navigate to={authRole === 'admin' ? "/admin" : "/"} replace /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
