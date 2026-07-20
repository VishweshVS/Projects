import React, { useEffect, useState } from 'react';
import { Users, LogOut, Briefcase, UserPlus, Calendar, Home } from 'lucide-react';
import api from '../services/api.js';
import AddEmployeeModal from '../models/AddEmployee'; 
import EditEmployeeModal from '../models/EditEmployee';
import HRManagement from '../models/HRMangement'; 
import HolidayCalendar from './HolidayCalendar.jsx'; // 📅 Import your new calendar view layer


const Dashboard = () => {
  const [role, setRole] = useState(''); 
  const [viewMode, setViewMode] = useState(''); 
  const [activeTab, setActiveTab] = useState('overview'); // 📂 Track structural view layouts ('overview' or 'holidays')
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    let savedRole = localStorage.getItem('ems_user_role');
    const token = localStorage.getItem('ems_token');

    if (!token) {
      window.location.href = '/';
      return;
    }
    
    if (!savedRole && token) {
      console.warn("Storage profile role key was missing. Attempting restoration pass...");
      savedRole = 'Admin'; 
      localStorage.setItem('ems_user_role', 'Admin');
    }

    const normalizedRole = savedRole ? savedRole.trim().toLowerCase() : 'employee';
    console.log("Current active dashboard authentication state role is:", normalizedRole);

    if (normalizedRole === 'admin' || normalizedRole === 'super admin') {
      const defaultRole = normalizedRole === 'super admin' ? 'Super Admin' : 'Admin';
      setRole(defaultRole);
      setViewMode(defaultRole); 
      fetchEmployees();
    } else if (normalizedRole === 'hr') {
      setRole('HR');
      setViewMode('HR');
      fetchEmployees();
    } else if (normalizedRole === 'manager') {
      setRole('Manager');
      setViewMode('Manager');
    } else {
      setRole('Employee');
      setViewMode('Employee');
      fetchSelfProfile(); 
    }
  }, []);

  const fetchSelfProfile = async () => {
    try {
      const response = await api.get('/employees/profile');
      if (response && response.data) {
        setProfileData(response.data);
      } else {
        setError('Profile payload returned empty from the corporate server.');
      }
    } catch (err) {
      console.error("Profile Fetch Failure Log:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Network Connection Failure: ${err.message}. Please check if your PHP backend server is running.`);
      } else {
        setError('An unexpected network disconnect occurred while communicating with the server.');
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/list');
      if (response && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else if (response && response.data && response.data.message) {
        setEmployees([]);
        setError(response.data.message);
      } else {
        setEmployees([]);
        setError('Received unexpected data layout from corporate system registry.');
      }
    } catch (err) {
      console.error("Employee Registry Fetch Failure Log:", err);
      setEmployees([]);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Network Connection Failure: ${err.message}. Ensure your local backend API is active.`);
      } else {
        setError('Failed to securely pull records from employee master roster.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user_role');
    window.location.href = '/';
  };

  const roleKey = (role || '').toLowerCase();

  const managerWidgets = [
    { label: 'Team Members', value: '18' },
    { label: 'Team Attendance', value: '94%' },
    { label: 'Pending Leave Requests', value: '6' },
    { label: 'Upcoming Birthdays', value: '4' },
    { label: 'Performance Reviews Pending', value: '2' },
    { label: 'Employees Working From Home', value: '7' }
  ];

  const employeeWidgets = [
    { label: "Today's Attendance", value: 'Present' },
    { label: 'Attendance Summary', value: '92%' },
    { label: 'Leave Balance', value: '8 days' },
    { label: 'Pending Leave Requests', value: '2' },
    { label: 'Upcoming Holidays', value: '3' },
    { label: 'Recent Announcements', value: '2' },
    { label: 'Assigned Assets', value: '1 laptop' },
    { label: 'Upcoming Birthdays', value: '1' },
    { label: 'Payslip Download', value: 'Ready' },
    { label: 'Profile Completion', value: '85%' }
  ];

  const managerQuickActions = ['Approve Leave', 'View Team Attendance', 'Submit Performance Review'];
  const employeeQuickActions = ['Check In', 'Check Out', 'Apply Leave', 'Update Profile', 'Download Payslip'];

  const managerNotifications = [
    { id: 1, title: 'Leave Approval', message: '2 leave requests need your review.', time: '10 min ago', priority: 'High' },
    { id: 2, title: 'Attendance Reminder', message: 'Team attendance review is due today.', time: '45 min ago', priority: 'Medium' },
    { id: 3, title: 'Birthday Wishes', message: 'A team member birthday is tomorrow.', time: '2 hrs ago', priority: 'Low' }
  ];

  const employeeNotifications = [
    { id: 1, title: 'Leave Approval', message: 'Your leave request was approved.', time: '20 min ago', priority: 'High' },
    { id: 2, title: 'Company Announcement', message: 'Quarterly town hall is scheduled this Friday.', time: '1 hr ago', priority: 'Medium' },
    { id: 3, title: 'Asset Return Reminder', message: 'Please return the borrowed laptop by Friday.', time: '3 hrs ago', priority: 'Low' }
  ];

  const notifications = (roleKey === 'manager' ? managerNotifications : employeeNotifications)
    .slice()
    .sort((a, b) => b.id - a.id);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* SIDEBAR CONTAINER */}
      <div className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          <div className="flex items-center space-x-2 px-2 py-4 border-b border-slate-700 mb-6">
            <Briefcase className="text-indigo-400" size={24} />
            <span className="text-xl font-bold tracking-wider">EMS PORTAL</span>
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium w-full text-left transition ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Home size={18} />
              <span>Overview Workspace</span>
            </button>

            {/* 📅 HOLIDAY CALENDAR BUTTON LINK */}
            <button 
              onClick={() => setActiveTab('holidays')}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium w-full text-left transition ${
                activeTab === 'holidays' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calendar size={18} />
              <span>Holiday Calendar</span>
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition font-medium w-full">
          <LogOut size={18} />
          <span>Secure Sign Out</span>
        </button>
      </div>

      {/* CORE DISPLAY REGION */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab === 'holidays' ? 'Holiday Schedule' : 'Workspace Management'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Clearance Tier: <strong className="text-indigo-600">{role}</strong></p>
          </div>
        </header>

        {/* Dynamic Route Display Conditional Render */}
        {activeTab === 'holidays' ? (
          <HolidayCalendar />
        ) : (
          <>
            {/* Clearance Console for Admin Toggling (Only visible on Overview) */}
            {(role === 'Admin' || role === 'Super Admin') && (
              <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <p className="text-sm font-medium text-indigo-900">
                    Clearance Console: Flip viewports to verify access mapping:
                  </p>
                </div>
                
                <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-inner gap-1">
                  <button
                    onClick={() => setViewMode(role)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                      viewMode === 'Admin' || viewMode === 'Super Admin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Admin View
                  </button>
                  
                  <button
                    onClick={() => setViewMode('HR')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                      viewMode === 'HR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    HR View
                  </button>

                  <button
                    onClick={() => {
                      setViewMode('Employee');
                      if (!profileData) fetchSelfProfile(); 
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                      viewMode === 'Employee' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Employee View
                  </button>
                </div>
              </div>
            )}

            {error && <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg">{error}</div>}

            {/* Viewports Engine */}
            {(() => {
              if (viewMode === 'Admin' || viewMode === 'Super Admin') {
                return (
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Users size={18} className="text-indigo-600" /> Master System Admin Console
                      </h3>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
                      >
                        <UserPlus size={16} /> Add Employee
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">View master backend structures, system logs, and API token overrides.</p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-gray-100">
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Department</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th> 
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                          {employees.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-6 py-10 text-center text-gray-400">No data found in corporate database system roster.</td>
                            </tr>
                          ) : (
                            employees.map((emp) => (
                              <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                                <td className="px-6 py-4 font-mono font-medium text-gray-400">#{emp.employee_code || emp.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{emp.first_name} {emp.last_name}</td>
                                <td className="px-6 py-4">{emp.company_email || 'N/A'}</td>
                                <td className="px-6 py-4">Dept ID: {emp.department_id || 'N/A'}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    emp.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {emp.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedEmployee(emp); 
                                      setIsEditModalOpen(true); 
                                    }} 
                                    className="px-2 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium rounded transition"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      if(window.confirm("Are you sure you want to delete this employee?")) {
                                        await api.delete(`/employees/delete/${emp.id}`);
                                        fetchEmployees(); 
                                      }
                                    }} 
                                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white font-medium rounded transition"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              } else if (viewMode === 'HR') {
                return <HRManagement />;
              } else if (viewMode === 'Manager') {
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {managerWidgets.map((widget) => (
                        <div key={widget.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                          <p className="text-sm text-gray-500">{widget.label}</p>
                          <p className="mt-2 text-2xl font-bold text-gray-900">{widget.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {managerQuickActions.map((action) => (
                            <button key={action} className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100">
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <div className="mt-4 space-y-3">
                          {notifications.map((item) => (
                            <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">{item.title}</p>
                                <span className="text-xs text-gray-500">{item.time}</span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">{item.priority}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {employeeWidgets.map((widget) => (
                        <div key={widget.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                          <p className="text-sm text-gray-500">{widget.label}</p>
                          <p className="mt-2 text-xl font-bold text-gray-900">{widget.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {employeeQuickActions.map((action) => (
                            <button key={action} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <div className="mt-4 space-y-3">
                          {notifications.map((item) => (
                            <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">{item.title}</p>
                                <span className="text-xs text-gray-500">{item.time}</span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">{item.priority}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })()}
          </>
        )}
      </div>

      {/* MODAL CONFIGURATIONS */}
      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchEmployees} 
      />
      <EditEmployeeModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }} 
        employee={selectedEmployee} 
        onRefresh={fetchEmployees} 
      />
    </div>
  );
};

export default Dashboard;