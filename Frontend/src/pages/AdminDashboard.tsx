import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings as SettingsIcon, 
  Database, 
  HelpCircle, 
  LogOut,
  Search,
  Bell,
  Moon,
  Filter,
  Download,
  UserPlus,
  
  CreditCard,
  User as UserIcon
} from 'lucide-react';
import SettingsPage from './Settings';
import Homepage from './homepage';

interface AdminDashboardProps {
  onLogout?: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Candidate' | 'Recruiter';
  status: 'Active' | 'Pending' | 'Inactive';
  lastActive: string;
  avatar: string;
}

interface Activity {
  id: number;
  type: 'user' | 'payment';
  title: string;
  subtitle: string;
  time: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const users: User[] = [
    {
      id: 1,
      name: 'dhia belhaj',
      email: 'dhia_belhaj@gmail.com',
      role: 'Admin',
      status: 'Active',
      lastActive: '2 hours ago',
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'ilef ben amor',
      email: 'ilef_benamor@gmail.com',
      role: 'Candidate',
      status: 'Active',
      lastActive: '5 minutes ago',
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'taima belheni',
      email: 'taima_belheni@gmail.com',
      role: 'Recruiter',
      status: 'Pending',
      lastActive: 'Never',
      avatar: 'ED'
    },
    {
      id: 4,
      name: 'ameni haj amor',
      email: 'ameni_hajamor@gmail.com.com',
      role: 'Candidate',
      status: 'Inactive',
      lastActive: '3 days ago',
      avatar: 'DW'
    },
  ];

  const activities: Activity[] = [
    {
      id: 1,
      type: 'user',
      title: 'New user registered',
      subtitle: 'sarah.jones@example.com',
      time: '2m ago'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment processed',
      subtitle: '$299.00 subscription renewal',
      time: '5m ago'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
      case 'Recruiter':
        return 'bg-purple-100 text-purple-700';
      case 'Candidate':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A202C] text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Console</h1>
        </div>
        
        <nav className="flex-1 px-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveMenu('Home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'Home'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="w-5 h-5">🏠</span>
              <span>Home</span>
            </button>
            
            <button
              onClick={() => setActiveMenu('Dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'Dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveMenu('Users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'Users'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </button>
            
            <button
              onClick={() => setActiveMenu('Organizations')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'Organizations'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Organizations</span>
            </button>
            
            <button
              onClick={() => setActiveMenu('Settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'Settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>
            
            <button
              onClick={() => setActiveMenu('Database')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'Database'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Database className="w-5 h-5" />
              <span>Database</span>
            </button>
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span>Help & Support</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-500 mt-1">Welcome back, Administrator</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users, organizations..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-gray-600" />
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Moon className="w-6 h-6 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3 ml-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  JA
                </div>
                <div>
                  <p className="font-semibold text-gray-900">John Admin</p>
                  <p className="text-sm text-gray-500">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeMenu === 'Home' ? (
          <div className="w-full overflow-y-auto">
            <Homepage isAuthenticated={true} />
          </div>
        ) : activeMenu === 'Settings' ? (
          <div className="p-8">
            <SettingsPage />
          </div>
        ) : (
          <div className="p-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Total Candidates</p>
                  <p className="text-3xl font-bold text-gray-900">24,847</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Total Recruiters</p>
                  <p className="text-3xl font-bold text-gray-900">5,629</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Sent Applications</p>
                  <p className="text-3xl font-bold text-gray-900">19,000</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Published Offers</p>
                  <p className="text-3xl font-bold text-gray-900">7,457</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">$</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                View All
              </a>
            </div>
            
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {activity.type === 'user' ? (
                      <UserIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.subtitle}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add User</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Active</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{user.lastActive}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            Edit
                          </button>
                          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Showing 1 to 5 of 247 results</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

