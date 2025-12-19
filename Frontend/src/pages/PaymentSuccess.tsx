import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import './PaymentSuccess.css';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    // Added verification guard - prevent multiple verifications
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No session ID found in URL');
        setIsProcessing(false);
        return;
      }

      try {
        const result = await apiService.handlePaymentSuccess(sessionId);
        
        // Payment verified successfully
        if (result.success !== false) {
          // Store success message in sessionStorage to show in dashboard
          sessionStorage.setItem('paymentSuccess', 'true');
          setSuccess(true);
          setIsProcessing(false);
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          // If success is explicitly false, show error
          setError(result.message || 'Failed to verify payment. Please contact support.');
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        // Only show error if it's a real error, not if payment was already processed
        const errorMessage = err.message || 'Failed to verify payment. Please contact support.';
        
        // Check if payment was already processed (this is actually a success case)
        if (errorMessage.includes('déjà enregistré') || errorMessage.includes('already processed')) {
          setSuccess(true);
          sessionStorage.setItem('paymentSuccess', 'true');
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setError(errorMessage);
          setIsProcessing(false);
          // Still redirect after showing error for a moment
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (isProcessing && !error && !success) {
    return (
      <div className="payment-success-container">
        <div className="payment-status">
          <div className="spinner"></div>
          <h2>Verifying your payment...</h2>
          <p>Please wait while we confirm your subscription.</p>
        </div>
      </div>
    );
  }

  if (success && !error) {
    return (
      <div className="payment-success-container">
        <div className="payment-status success">
          <div className="success-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>Your subscription has been activated. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-container">
        <div className="payment-status error">
          <div className="error-icon">❌</div>
          <h2>Payment Verification Failed</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentSuccess;

