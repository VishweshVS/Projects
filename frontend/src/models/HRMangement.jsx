import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function HRManagement() {
  // --- State Variables ---
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    status: 'Active' // Defaulting to Active per business specs
  });

  // --- Real-Time Statistics (Widgets) ---
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const inactiveCount = employees.filter(e => e.status === 'Inactive').length;

  // --- Live API Fetching Loop ---
  const fetchLiveRoster = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employees/list');
      if (response && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setError('Unexpected formatting returned from the directory service.');
      }
    } catch (err) {
      console.error("HR Management database connection issue:", err);
      setError(err.response?.data?.message || 'Failed to sync with live backend rosters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRoster();
  }, []);

  // --- Soft Delete / Status Toggle API Integration ---
  // 📂 Location: HRManagement.jsx -> handleStatusToggle Method

const handleStatusToggle = async (id, currentStatus) => {
  const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
  
  try {
    // 🛡️ Ensure the URL and payload body parameters follow this exact shape
    const response = await api.put(`/index.php/employees/update-status/${id}`, 
      {status: newStatus },
      { headers: { 'Content-Type': 'application/json' } 

    });
    
    // Optimistic UI update on success
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, status: newStatus } : emp
    ));
    
    console.log("Database status patch committed:", response.data);
  } catch (err) {
    console.error("Transmission breakdown breakdown:", err.response?.data);
    alert(err.response?.data?.message || 'Failed to modify employee status.');
  }
};

  // --- Search & Filter Logic Matrix ---
  const filteredEmployees = employees.filter(emp => {
    const searchTarget = searchTerm.toLowerCase();
    
    // Fallback checks against undefined database strings to prevent processing crashes
    const nameMatch = emp.first_name?.toLowerCase().includes(searchTarget) || 
                      emp.last_name?.toLowerCase().includes(searchTarget);
    const codeMatch = emp.employee_code?.toLowerCase().includes(searchTarget);
    const emailMatch = emp.company_email?.toLowerCase().includes(searchTarget);

    const matchesSearch = nameMatch || codeMatch || emailMatch;
    
    // Dynamic numeric or string evaluation checks
    const matchesDept = filters.department === '' || String(emp.department_id) === filters.department;
    const matchesStatus = filters.status === '' || emp.status === filters.status;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">HR Core Administrator Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system lifecycles, run audits, and update directories.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* HR DASHBOARD WIDGET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Staff Registered</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalEmployees}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Staff Layers</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{activeCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Deactivated Profiles</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{inactiveCount}</p>
        </div>
      </div>

      {/* FILTER & CONTROL PANEL CONSOLE */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/3 relative">
          <input 
            type="text"
            placeholder="Search by ID, name, or system email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="w-full md:w-auto flex flex-wrap gap-3 items-center">
          <select 
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
            className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="1">Engineering (Dept 1)</option>
            <option value="2">HR (Dept 2)</option>
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* EMPLOYEE LIST DATA TABLE MATRIX */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Code / ID</th>
                <th className="px-6 py-4">Employee Details</th>
                <th className="px-6 py-4">Department ID</th>
                <th className="px-6 py-4">Status Flag</th>
                <th className="px-6 py-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400">Synchronizing relational system layers...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400">No records found matching current configuration matrices.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-indigo-600">
                      #{emp.employee_code || emp.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{emp.company_email || 'No email registered'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium font-mono text-xs">ID: {emp.department_id || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emp.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-medium space-x-2">
                      <button 
                        onClick={() => handleStatusToggle(emp.id, emp.status)}
                        className={`px-2.5 py-1.5 rounded-md transition-all border ${
                          emp.status === 'Active'
                            ? 'text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}