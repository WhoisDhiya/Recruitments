import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { User } from "./types";
import { apiService } from "./services/api";
import type { Offer } from "./types";
import Homepage from './pages/homepage.tsx';
import Signup from './pages/signup.tsx';
import SignIn from './pages/SignIn.tsx';
import Dashboard from './pages/Dashboard.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import RecruiterDashboard from './pages/RecruiterDashboard.tsx';
import Settings from './pages/Settings.tsx';
import PostJobPage from './pages/PostJobPage.tsx';
import MyJobs from './pages/MyJobs.tsx';
import JobDetails from './pages/JobDetails.tsx';
import EmployerProfile from './pages/EmployerProfile.tsx';

//Added MyJobs route in App.tsx and imported MyJobs.
//Updated PostJobPage.tsx sidebar handler so clicking "My Jobs" navigates to /my-jobs.
//Updated RecruiterDashboard.tsx sidebar click handler so clicking "My Jobs" navigates to /my-jobs.


function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier et synchroniser l'état d'authentification depuis localStorage
    const currentUser = apiService.getCurrentUser();
    const authenticated = apiService.isAuthenticated();

    if (authenticated) {
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    // Vérifier la santé du backend
    apiService.getHealth()
      .then((data) => {
        const newStatus = `✅ Backend connected — DB: ${data.database}`;
        setStatus(newStatus);
        console.log("App Status:", newStatus);
      })
      .catch(() => {
        const newStatus = "❌ Backend not reachable";
        setStatus(newStatus);
        console.error("App Status:", newStatus);
      });

    // Charger les offres
    apiService.getOffers()
      .then((data) => {
        console.log(`Successfully fetched ${data.length} job offers.`);
        setOffers(data);
      })
      .catch((error) => {
        console.error("Failed to fetch offers:", error);
        setOffers([]);
      });
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-gray-900">

        {/* Backend status bar */}
        <div className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700 border-b">
          Application Status: {status}
          <span className="ml-4 text-gray-500">
            | Initial Offers Loaded: {offers.length}
          </span>
          {isAuthenticated && user && (
            <span className="ml-4 text-green-600">
              | Connecté: {user.first_name} {user.last_name}
            </span>
          )}
        </div>

        {/* Main content */}
        <Routes>
          <Route path="/" element={<Homepage user={user || undefined} isAuthenticated={isAuthenticated} onLogout={handleLogout} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn onLogin={handleLogin} />
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? (
              user?.role === 'recruiter'
                ? <RecruiterDashboard onLogout={handleLogout} user={user || undefined} />
                : <Dashboard onLogout={handleLogout} user={user || undefined} />
            ) : <Navigate to="/signin" />
          } />
          <Route path="/settings" element={
            isAuthenticated ? <Settings user={user || undefined} /> : <Navigate to="/signin" />
          } />
          <Route path="/admin" element={<AdminDashboard onLogout={handleLogout} />} />
          <Route path="/post-job" element={
            isAuthenticated && user?.role === 'recruiter'
              ? <PostJobPage onLogout={handleLogout} user={user || undefined} />
              : <Navigate to="/signin" />
          } />
          <Route path="/my-jobs" element={
            isAuthenticated && user?.role === 'recruiter'
              ? <MyJobs onLogout={handleLogout} user={user || undefined} />
              : <Navigate to="/signin" />
          } />
          <Route path="/job-details/:id" element={
            isAuthenticated && user?.role === 'recruiter'
              ? <JobDetails onLogout={handleLogout} user={user || undefined} />
              : <Navigate to="/signin" />
          } />
          <Route path="/employer-profile" element={
            isAuthenticated && user?.role === 'recruiter'
              ? <EmployerProfile onLogout={handleLogout} user={user || undefined} />
              : <Navigate to="/signin" />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
