import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { apiService } from '../services/api';
import RecruiterDashboard from './RecruiterDashboard';
import type { User } from '../types';

interface ProtectedRecruiterDashboardProps {
  onLogout: () => void;
  user: User | undefined;
}

const ProtectedRecruiterDashboard: React.FC<ProtectedRecruiterDashboardProps> = ({ onLogout, user }) => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, [user?.id]);

  const checkSubscription = async () => {
    try {
      setIsChecking(true);
      
      // Get recruiter info from localStorage
      const recruiter = JSON.parse(localStorage.getItem('recruiter') || '{}');
      const recruiterId = recruiter?.id;

      if (!recruiterId) {
        console.warn('No recruiter ID found');
        setHasActiveSubscription(false);
        return;
      }

      // Check if recruiter has active subscription
      const response = await apiService.checkActiveSubscription(recruiterId);
      
      if (response && response.hasActiveSubscription) {
        setHasActiveSubscription(true);
      } else {
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // If error, assume no subscription to be safe
      setHasActiveSubscription(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return <Navigate to="/payment-required" replace />;
  }

  return <RecruiterDashboard onLogout={onLogout} user={user} />;
};

export default ProtectedRecruiterDashboard;
