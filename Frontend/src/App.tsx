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
import FindJobsList from './pages/FindJobsList.tsx';
import JobApplicationPage from './pages/JobApplicationPage.tsx';
import SavedJobs from './pages/SavedJobs.tsx';
import CandidateSettings from './pages/CandidateSettings.tsx';
import CandidateNotifications from './pages/CandidateNotifications.tsx';
import CustomerSupport from './pages/CustomerSupport.tsx';
import AppliedJobs from './pages/AppliedJobs.tsx';
import ApplicationDetails from './pages/ApplicationDetails.tsx';
import SubscriptionPlans from './pages/SubscriptionPlans.tsx';
import PaymentSuccess from './pages/PaymentSuccess.tsx';

//Added MyJobs route in App.tsx and imported MyJobs.
//Updated PostJobPage.tsx sidebar handler so clicking "My Jobs" navigates to /my-jobs.
//Updated RecruiterDashboard.tsx sidebar click handler so clicking "My Jobs" navigates to /my-jobs.


function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isVerifyingUser, setIsVerifyingUser] = useState(false);
  // Initialiser depuis localStorage AVANT le premier render pour éviter le logout au refresh
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = apiService.getCurrentUser();
    console.log('🔐 App initialization - User from localStorage:', storedUser);
    return storedUser;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = apiService.isAuthenticated();
    console.log('🔐 App initialization - isAuthenticated from localStorage:', auth);
    return auth;
  });

  useEffect(() => {
    console.log('🔄 App useEffect - Current state:', { isAuthenticated, user: user?.email });
    
    // Vérifier depuis localStorage pour synchroniser l'état
    const currentUser = apiService.getCurrentUser();
    const authenticated = apiService.isAuthenticated();
    
    console.log('🔄 App useEffect - localStorage check:', { authenticated, currentUser: currentUser?.email });

    // IMPORTANT: Ne JAMAIS mettre isAuthenticated à false si on avait déjà un état authentifié
    // au refresh, sauf si localStorage est vraiment vide (pas juste une vérification qui échoue)
    if (authenticated && currentUser) {
      setIsVerifyingUser(true);
      // Vérifier que l'utilisateur existe toujours dans la base de données
      apiService.verifyUser()
        .then((result) => {
          setIsVerifyingUser(false);
          if (result.valid && result.user) {
            console.log('✅ User verified, updating state');
            setUser(result.user);
            setIsAuthenticated(true);
          } else {
            console.log('❌ User verification failed, logging out');
            handleLogout();
            window.location.href = '/signin';
          }
        })
        .catch((error) => {
          setIsVerifyingUser(false);
          console.error('❌ Error verifying user:', error);
          // En cas d'erreur, déconnecter pour être sûr
          handleLogout();
          window.location.href = '/signin';
        });
    } else {
      setIsVerifyingUser(false);
    } 
    // NE PAS mettre à false automatiquement - laisser l'initialisation synchrone gérer ça
    // else if (!authenticated && isAuthenticated) {
    //   // Ne pas nettoyer automatiquement au refresh - peut-être que le token est encore valide
    //   console.log('⚠️ localStorage says not authenticated, but keeping state as is');
    // }

    // Écouter l'événement de suppression d'utilisateur
    const handleUserDeleted = () => {
      console.log('🚪 User deleted event received, logging out...');
      handleLogout();
      // Rediriger vers la page de connexion
      window.location.href = '/signin';
    };
    
    window.addEventListener('userDeleted', handleUserDeleted);

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

    // Cleanup
    return () => {
      window.removeEventListener('userDeleted', handleUserDeleted);
    };
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

  // Afficher un loader pendant la vérification de l'utilisateur
  if (isVerifyingUser && isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    );
  }

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
              user?.role === 'admin'
                ? <AdminDashboard onLogout={handleLogout} />
                : user?.role === 'recruiter'
                ? <RecruiterDashboard onLogout={handleLogout} user={user || undefined} />
                : <Dashboard onLogout={handleLogout} user={user || undefined} isAuthenticated={isAuthenticated} />
            ) : <Navigate to="/signin" />
          } />
          <Route path="/settings" element={
            isAuthenticated 
              ? (user?.role === 'candidate' 
                  ? <CandidateSettings user={user || undefined} onLogout={handleLogout} />
                  : <Settings user={user || undefined} />)
              : <Navigate to="/signin" />
          } />
          <Route path="/admin" element={
            isAuthenticated && user?.role === 'admin'
              ? <AdminDashboard onLogout={handleLogout} />
              : <Navigate to="/signin" />
          } />
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
            isAuthenticated
              ? <JobDetails onLogout={handleLogout} user={user || undefined} />
              : <Navigate to="/signin" />
          } />
          <Route path="/employer-profile" element={
            isAuthenticated && user?.role === 'recruiter'
              ? <EmployerProfile onLogout={handleLogout} user={user || undefined} />
              : <Navigate to="/signin" />
          } />
          <Route path="/find-jobs" element={
            <FindJobsList isAuthenticated={isAuthenticated} user={user || undefined} onLogout={handleLogout} />
          } />
          <Route path="/job-application/:jobId" element={
            isAuthenticated
              ? <JobApplicationPage user={user || undefined} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
              : <Navigate to="/signin" />
          } />
          <Route path="/saved-jobs" element={
            isAuthenticated && user?.role === 'candidate'
              ? <SavedJobs user={user || undefined} onLogout={handleLogout} />
              : <Navigate to="/signin" />
          } />
          <Route path="/applied-jobs" element={
            isAuthenticated && user?.role === 'candidate'
              ? <AppliedJobs user={user || undefined} onLogout={handleLogout} />
              : <Navigate to="/signin" />
          } />
          <Route path="/application-details/:id" element={
            isAuthenticated && user?.role === 'candidate'
              ? <ApplicationDetails user={user || undefined} onLogout={handleLogout} />
              : <Navigate to="/signin" />
          } />
          <Route path="/notifications" element={
            isAuthenticated && user?.role === 'candidate'
              ? <CandidateNotifications user={user || undefined} onLogout={handleLogout} />
              : <Navigate to="/signin" />
          } />
          <Route path="/customer-support" element={
            isAuthenticated && user?.role === 'candidate'
              ? <CustomerSupport user={user || undefined} onLogout={handleLogout} />
              : <Navigate to="/signin" />
          } />
          <Route path="/subscription-plans" element={
            isAuthenticated && user?.role === 'recruiter'
              ? <SubscriptionPlans user={user || undefined} />
              : <Navigate to="/signin" />
          } />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h2>Payment Cancelled</h2>
              <p>Your payment was cancelled. You can try again later.</p>
              <button onClick={() => window.location.href = '/subscription-plans'}>
                Return to Plans
              </button>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
