import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import './PaymentSuccess.css';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No session ID found in URL');
        setIsProcessing(false);
        return;
      }

      try {
      await apiService.handlePaymentSuccess(sessionId);
      // Payment verified successfully, redirect to dashboard after a short delay
      // Store success message in sessionStorage to show in dashboard
      sessionStorage.setItem('paymentSuccess', 'true');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Failed to verify payment. Please contact support.');
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (isProcessing && !error) {
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

  return (
    <div className="payment-success-container">
      <div className="payment-status success">
        <div className="success-icon">✅</div>
        <h2>Payment Successful!</h2>
        <p>Your subscription has been activated. Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;

