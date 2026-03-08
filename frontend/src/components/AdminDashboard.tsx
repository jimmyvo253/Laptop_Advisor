import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { laptopService } from '../api/laptopService';
import type { Laptop, LaptopCreate } from '../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<LaptopCreate>({
    name: '', performance: 5, resolution: 5, capacity: 5, portability: 5, battery: 5, price: 5
  });

  useEffect(() => {
    fetchLaptops();
  }, []);

  const fetchLaptops = async () => {
    try {
      const data = await laptopService.getAll();
      setLaptops(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', performance: 5, resolution: 5, capacity: 5, portability: 5, battery: 5, price: 5 });
    setEditingLaptop(null);
    setShowAddForm(false);
  };

  const handleEdit = (laptop: Laptop) => {
    setEditingLaptop(laptop);
    setFormData({
      name: laptop.name,
      performance: laptop.performance,
      resolution: laptop.resolution,
      capacity: laptop.capacity,
      portability: laptop.portability,
      battery: laptop.battery,
      price: laptop.price
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await laptopService.delete(id);
        alert('Laptop deleted successfully');
        fetchLaptops();
      } catch (err) {
        alert('Error deleting laptop');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingLaptop && editingLaptop.id) {
        await laptopService.update(editingLaptop.id, formData);
        alert('SUCCESS: Laptop updated!');
      } else {
        await laptopService.create(formData);
        alert('SUCCESS: Laptop added to database!');
      }
      resetForm();
      fetchLaptops();
    } catch (err) {
      alert('ERROR: Could not process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container" style={{ padding: '20px' }}>
      <style>{`
        .action-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .edit-btn {
          background-color: #fffbeb;
          color: #92400e;
          border-color: #fde68a;
        }
        .edit-btn:hover {
          background-color: #fef3c7;
          border-color: #fbbf24;
          transform: translateY(-1px);
        }
        .delete-btn-modern {
          background-color: #fef2f2;
          color: #991b1b;
          border-color: #fecaca;
        }
        .delete-btn-modern:hover {
          background-color: #fee2e2;
          border-color: #ef4444;
          transform: translateY(-1px);
        }
        .admin-table-modern th {
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: #64748b;
        }
        .admin-table-modern tr:hover {
          background-color: #f8fafc;
        }
      `}</style>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/')}
          className="secondary-btn"
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Back
        </button>
      </div>

      <div className="card" style={{ border: '1px solid var(--border)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
          <h2 style={{ margin: 0 }}>
            {editingLaptop ? 'Edit Laptop' : 'Laptop Management'}
          </h2>
          <button 
            className="primary-btn" 
            style={{ backgroundColor: (showAddForm && !editingLaptop) ? '#ef4444' : '#4f46e5', fontSize: '1.2rem', padding: '10px 20px' }}
            onClick={() => {
                if (showAddForm) resetForm();
                else setShowAddForm(true);
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add New Laptop'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} style={{ padding: '20px', borderTop: '1px solid #eee' }}>
            <div className="form-group">
              <label>Laptop Model Name</label>
              <input 
                type="text" value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                placeholder="e.g. MacBook Pro 14"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', margin: '15px 0' }}>
              {['performance', 'resolution', 'capacity', 'portability', 'battery', 'price'].map((field) => (
                <div key={field} className="form-group">
                  <label>{field.toUpperCase()} (1-10)</label>
                  <input 
                    type="number" min="1" max="10" 
                    value={(formData as any)[field]}
                    onChange={e => setFormData({...formData, [field]: Number(e.target.value)})}
                    required
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Processing...' : (editingLaptop ? 'SAVE CHANGES' : 'CONFIRM & ADD TO DATABASE')}
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <h3>Current Inventory ({laptops.length} Laptops)</h3>
        <table className="admin-table admin-table-modern" style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>Name</th>
              <th style={{ borderBottom: '1px solid var(--border)' }}>Perf</th>
              <th style={{ borderBottom: '1px solid var(--border)' }}>Res</th>
              <th style={{ borderBottom: '1px solid var(--border)' }}>Cap</th>
              <th style={{ borderBottom: '1px solid var(--border)' }}>Port</th>
              <th style={{ borderBottom: '1px solid var(--border)' }}>Bat</th>
              <th style={{ borderBottom: '1px solid var(--border)' }}>Price</th>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {laptops.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 500 }}>{l.name}</td>
                <td>{l.performance}</td>
                <td>{l.resolution}</td>
                <td>{l.capacity}</td>
                <td>{l.portability}</td>
                <td>{l.battery}</td>
                <td>{l.price}</td>
                <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button 
                    onClick={() => handleEdit(l)}
                    className="action-btn edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => l.id && handleDelete(l.id, l.name)}
                    className="action-btn delete-btn-modern"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
