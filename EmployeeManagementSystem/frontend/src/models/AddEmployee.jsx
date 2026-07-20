import React, { useState } from 'react';
import api from '../services/api'; 

export default function AddEmployeeModal({ isOpen, onClose, onRefresh }) {
  const initialFormState = {
    employee_code: '',
    first_name: '',
    last_name: '',
    personal_email: '',
    company_email: '',
    password: '', 
    joining_date: new Date().toISOString().split('T')[0], 
    department_id: '1',
    designation_id: '1',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleModalClose = () => {
    setFormData(initialFormState); // Clean state completely on dismiss/close
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/employees/create', formData);
      onRefresh(); 
      handleModalClose(); // Closes modal cleanly and flushes out stale entries
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register the record profile entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Add New Employee Profile</h3>
          <button onClick={handleModalClose} className="text-gray-400 hover:text-gray-600 text-xl font-medium">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employee Code</label>
              <input 
                type="text" 
                name="employee_code" 
                required 
                placeholder="EMP002" 
                value={formData.employee_code} // FIXED: Added value synchronization mapping
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
              <select 
                name="status" 
                value={formData.status} // FIXED: Explicit component binding control
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
              <input 
                type="text" 
                name="first_name" 
                required 
                value={formData.first_name} // FIXED: Explicit state binding
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
              <input 
                type="text" 
                name="last_name" 
                required 
                value={formData.last_name} // FIXED: Explicit state binding
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Email</label>
            <input 
              type="email" 
              name="company_email" 
              required 
              placeholder="name@company.com" 
              value={formData.company_email} // FIXED: Explicit state binding
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Password</label>
            <input
              type="password"
              name="password" // FIXED: Added matching attribute target name string
              placeholder="Leave blank for default: Welcome@123"
              className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm"
              value={formData.password}
              onChange={handleChange} // FIXED: Streamlined into generic handler execution
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Personal Email</label>
            <input 
              type="email" 
              name="personal_email" 
              value={formData.personal_email} // FIXED: Explicit state binding
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department ID</label>
              <input 
                type="number" 
                name="department_id" 
                value={formData.department_id} // FIXED: Swapped defaultValue out for clean value tracking
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Designation ID</label>
              <input 
                type="number" 
                name="designation_id" 
                value={formData.designation_id} // FIXED: Swapped defaultValue out for clean value tracking
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Joining Date</label>
            <input 
              type="date" 
              name="joining_date" 
              value={formData.joining_date} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm" 
            />
          </div>

          <div className="pt-4 border-t flex justify-end space-x-2">
            <button type="button" onClick={handleModalClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg shadow-sm">
              {loading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}