import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  LogOut,
  
  Briefcase, // Icon for Applications
  UserRoundCog, // Icon for Recruiters
  UserRoundSearch // Icon for Candidates
} from 'lucide-react';
import { apiService } from '../services/api';
import type {
  User as UserType,
  Candidate as CandidateType,
  Recruiter as RecruiterType,
  Application as ApplicationType,
  AdminStats // Added AdminStats type
} from '../types';

interface AdminDashboardProps {
  onLogout?: () => void;
}

// Removed local Activity interface as it's now imported

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [users, setUsers] = useState<UserType[]>([]);
  const [candidates, setCandidates] = useState<CandidateType[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterType[]>([]);
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null); // New state for admin stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        switch (activeMenu) {
          case 'Users':
            data = await apiService.getUsers();
            // Filter out admin users and ensure data conforms to UserType structure
            setUsers(data
              .filter((user: UserType) => user.role !== 'admin')
              .map((user: UserType) => ({ 
                ...user,
                name: `${user.first_name} ${user.last_name}`,
                avatar: user.first_name.substring(0,1).toUpperCase() + user.last_name.substring(0,1).toUpperCase(),
                status: user.status || 'Active',
                lastActive: user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A',
              })));
            break;
          case 'Candidates':
            data = await apiService.getAdminCandidates();
            setCandidates(data.map((candidate: CandidateType) => ({
              ...candidate,
              user: { 
                ...candidate.user,
                name: `${candidate.user?.first_name || ''} ${candidate.user?.last_name || ''}`,
                avatar: (candidate.user?.first_name?.substring(0,1).toUpperCase() || '') + (candidate.user?.last_name?.substring(0,1).toUpperCase() || ''),
              } as UserType, // Cast to UserType to ensure derived properties are compatible
              status: candidate.status || 'Active',
              profileViews: candidate.profileViews || 0,
            })));
            break;
          case 'Recruiters':
            data = await apiService.getAdminRecruiters();
            setRecruiters(data.map((recruiter: RecruiterType) => ({
              ...recruiter,
              user: {
                ...recruiter.user,
                name: `${recruiter.user?.first_name || ''} ${recruiter.user?.last_name || ''}`,
                avatar: (recruiter.user?.first_name?.substring(0,1).toUpperCase() || '') + (recruiter.user?.last_name?.substring(0,1).toUpperCase() || ''),
              } as UserType, // Cast to UserType to ensure derived properties are compatible
              status: recruiter.status || 'Active',
              postedOffers: recruiter.postedOffers || 0,
            })));
            break;
          case 'Applications':
            data = await apiService.getAdminApplications();
            setApplications(data.map((app: any) => ({
              ...app,
              candidateName: app.first_name && app.last_name 
                ? `${app.first_name} ${app.last_name}`.trim()
                : app.candidate?.user?.first_name && app.candidate?.user?.last_name
                ? `${app.candidate.user.first_name} ${app.candidate.user.last_name}`.trim()
                : 'N/A',
              jobTitle: app.offer_title || app.offer?.title || 'N/A',
              dateApplied: app.date_application ? new Date(app.date_application).toLocaleDateString() : 'N/A',
            })));
            break;
          case 'Dashboard': {
            const stats = await apiService.getAdminStats();
            setAdminStats(stats);
            break; 
          }
          default:
            setUsers([]); 
            setCandidates([]);
            setRecruiters([]);
            setApplications([]);
            break;
        }
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
        console.error(`Failed to fetch ${activeMenu}:`, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (['Users', 'Candidates', 'Recruiters', 'Applications', 'Dashboard'].includes(activeMenu)) {
      fetchData();
    }
  }, [activeMenu]);

  // Vérifier que l'utilisateur existe toujours au chargement
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const verification = await apiService.verifyUser();
        if (!verification.valid) {
          console.log('❌ Admin user no longer exists, redirecting to signin');
          if (onLogout) {
            onLogout();
          }
          window.location.href = '/signin';
        }
      } catch (error) {
        console.error('Error verifying admin user:', error);
        // Si erreur de vérification, déconnecter
        if (error instanceof Error && (error.message.includes('supprimé') || error.message.includes('401'))) {
          if (onLogout) {
            onLogout();
          }
          window.location.href = '/signin';
        }
      }
    };
    
    verifyUser();
  }, [onLogout]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'recruiter':
        return 'bg-yellow-100 text-yellow-700';
      case 'candidate':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'accepted':
      case 'reviewed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Inactive':
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'interview':
          return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
        console.error('Failed to delete user:', err);
        alert(`Error deleting user: ${errorMessage}`);
      }
    }
  };


  const handleDeleteCandidate = async (candidateId: number) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await apiService.deleteCandidate(candidateId);
        setCandidates(candidates.filter(candidate => candidate.id !== candidateId));
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
        console.error('Failed to delete candidate:', err);
        alert(`Error deleting candidate: ${errorMessage}`);
      }
    }
  };

  const handleDeleteRecruiter = async (recruiterId: number) => {
    if (window.confirm('Are you sure you want to delete this recruiter?')) {
      try {
        await apiService.deleteRecruiter(recruiterId);
        setRecruiters(recruiters.filter(recruiter => recruiter.id !== recruiterId));
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
        console.error('Failed to delete recruiter:', err);
        alert(`Error deleting recruiter: ${errorMessage}`);
      }
    }
  };

  const handleDeleteApplication = async (applicationId: number) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await apiService.deleteApplicationAdmin(applicationId);
        setApplications(applications.filter(app => app.id !== applicationId));
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
        console.error('Failed to delete application:', err);
        alert(`Error deleting application: ${errorMessage}`);
      }
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: number, currentStatus: string) => {
    const newStatus = prompt(`Enter new status for application ${applicationId} (current: ${currentStatus}). Allowed: pending, reviewed, accepted, rejected`);
    if (newStatus && ['pending', 'reviewed', 'accepted', 'rejected'].includes(newStatus.toLowerCase())) {
      try {
        await apiService.updateApplicationStatusAdmin(applicationId, newStatus.toLowerCase() as ApplicationType['status']);
        setApplications(applications.map(app => app.id === applicationId ? { ...app, status: newStatus.toLowerCase() as ApplicationType['status'] } : app));
        alert('Application status updated successfully!');
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
        console.error('Failed to update application status:', err);
        alert(`Error updating application status: ${errorMessage}`);
      }
    } else if (newStatus !== null) {
      alert('Invalid status. Please enter pending, reviewed, accepted, or rejected.');
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
              onClick={() => setActiveMenu('Candidates')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'Candidates'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <UserRoundSearch className="w-5 h-5" />
              <span>Candidates</span>
            </button>

            <button
              onClick={() => setActiveMenu('Recruiters')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'Recruiters'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <UserRoundCog className="w-5 h-5" />
              <span>Recruiters</span>
            </button>

            <button
              onClick={() => setActiveMenu('Applications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'Applications'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Applications</span>
            </button>
            
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          
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
              <h1 className="text-3xl font-bold text-gray-900">
                
                {activeMenu === 'Dashboard' && 'Dashboard Overview'}
                {activeMenu === 'Users' && 'User Management'}
                {activeMenu === 'Candidates' && 'Candidate Management'}
                {activeMenu === 'Recruiters' && 'Recruiter Management'}
                {activeMenu === 'Applications' && 'Application Management'}
              </h1>
              <p className="text-gray-500 mt-1">Welcome back, Administrator</p>
            </div>
            
            
          </div>
        </header>

        {/* Dashboard Content */}
        {activeMenu === 'Users' ? (
          <div className="p-8">
            {loading && <p>Loading users...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.avatar || (user.first_name && user.last_name ? user.first_name.substring(0,1).toUpperCase() + user.last_name.substring(0,1).toUpperCase() : 'U')}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
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
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'Active')}`}>
                              {user.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button 
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                              onClick={() => handleDeleteUser(user.id)}
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
            )}
          </div>
        ) : activeMenu === 'Candidates' ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Candidate Management</h2>
            {loading && <p>Loading candidates...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Candidate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((candidate) => (
                        <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {candidate.user?.avatar || (candidate.user?.first_name && candidate.user?.last_name ? candidate.user.first_name.substring(0,1).toUpperCase() + candidate.user.last_name.substring(0,1).toUpperCase() : 'C')}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{candidate.user?.first_name} {candidate.user?.last_name}</p>
                                <p className="text-sm text-gray-500">{candidate.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{candidate.user_id}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status || 'Active')}`}>
                              {candidate.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button 
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                              onClick={() => handleDeleteCandidate(candidate.id)}
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
            )}
          </div>
        ) : activeMenu === 'Recruiters' ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recruiter Management</h2>
            {loading && <p>Loading recruiters...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Recruiter</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recruiters.map((recruiter) => (
                        <tr key={recruiter.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {recruiter.user?.avatar || (recruiter.user?.first_name && recruiter.user?.last_name ? recruiter.user.first_name.substring(0,1).toUpperCase() + recruiter.user.last_name.substring(0,1).toUpperCase() : 'R')}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{recruiter.user?.first_name} {recruiter.user?.last_name}</p>
                                <p className="text-sm text-gray-500">{recruiter.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{recruiter.user_id}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{recruiter.company_name}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(recruiter.status || 'Active')}`}>
                              {recruiter.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button 
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                              onClick={() => handleDeleteRecruiter(recruiter.id)}
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
            )}
          </div>
        ) : activeMenu === 'Applications' ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Management</h2>
            {loading && <p>Loading applications...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Application ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Candidate Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Job Title</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date Applied</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-600">{app.id}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{app.candidateName}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{app.jobTitle}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{app.dateApplied}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button 
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm mr-4"
                              onClick={() => handleUpdateApplicationStatus(app.id, app.status)}
                            >
                              Edit Status
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                              onClick={() => handleDeleteApplication(app.id)}
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
            )}
          </div>
        ) : (
          <div className="p-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total Candidates</p>
                    <p className="text-3xl font-bold text-gray-900">{adminStats?.candidates ?? 0}</p>
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
                    <p className="text-3xl font-bold text-gray-900">{adminStats?.recruiters ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    
                    <Users className="w-6 h-6 text-green-600" /> 
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Sent Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{adminStats?.applications ?? 0}</p>
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
                    <p className="text-3xl font-bold text-gray-900">{adminStats?.offers ?? 0}</p>
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
              
              <div className="space-y-4 text-gray-500">
                <p>Recent activities will be displayed here once a backend API is implemented.</p>
                <p>This could include new user registrations, new job postings, etc.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;




