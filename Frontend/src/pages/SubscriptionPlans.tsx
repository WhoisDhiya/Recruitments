import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { User } from '../types';
import './SubscriptionPlans.css';

interface Pack {
  id: number;
  name: string;
  price: number;
  job_limit: number;
  candidate_limit: number;
  visibility_days: number;
  description: string;
}

interface SubscriptionPlansProps {
  user?: User;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ user }) => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPacks = async () => {
      try {
        setIsLoading(true);
        const packsData = await apiService.getPacks();
        // Sort packs: basic, standard, premium
        const sortedPacks = packsData.sort((a: Pack, b: Pack) => {
          const order: Record<string, number> = { basic: 1, standard: 2, premium: 3 };
          return (order[a.name] || 999) - (order[b.name] || 999);
        });
        setPacks(sortedPacks);
      } catch (err) {
        console.error('Error loading packs:', err);
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPacks();
  }, []);

  const handleSubscribe = async (pack: Pack) => {
    if (!user?.id) {
      alert('You must be logged in to subscribe');
      navigate('/signin');
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Get recruiter ID
      const recruiter = await apiService.getRecruiterByUserId(user.id);
      const recruiterId = recruiter.id;

      // Create Stripe checkout session
      const { url } = await apiService.createCheckoutSession(recruiterId, pack.id);
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const getPackFeatures = (pack: Pack) => {
    const features = [];
    
    if (pack.job_limit === 999 || pack.job_limit >= 100) {
      features.push({ icon: '💼', text: 'Unlimited Job Postings' });
    } else {
      features.push({ icon: '💼', text: `${pack.job_limit} Job Postings` });
    }

    if (pack.candidate_limit >= 1000) {
      features.push({ icon: '👥', text: `${pack.candidate_limit} Candidate Views` });
    } else if (pack.candidate_limit >= 100) {
      features.push({ icon: '👥', text: `${pack.candidate_limit} Candidate Views` });
    } else {
      features.push({ icon: '👥', text: `${pack.candidate_limit} Candidate Views` });
    }

    features.push({ icon: '📅', text: `${pack.visibility_days} Days Visibility` });
    features.push({ icon: '✅', text: 'Priority Support' });

    return features;
  };

  const getPackDescription = (packName: string) => {
    const descriptions: Record<string, string> = {
      basic: 'Pack Basic: 3 offres, visibilité 30 jours',
      standard: 'Pack Standard: 10 offres, visibilité 60 jours, plus de candidats',
      premium: 'Pack Premium: Illimité pendant 1 an'
    };
  return descriptions[packName.toLowerCase()] || '';
  };

  const getPackBadge = (packName: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      standard: { text: 'RECOMMENDED', color: 'blue' },
      premium: { text: 'MOST POPULAR', color: 'orange' }
    };
    return badges[packName.toLowerCase()];
  };

  const getButtonColor = (packName: string) => {
    const colors: Record<string, string> = {
      basic: 'purple',
      standard: 'blue',
      premium: 'orange'
    };
    return colors[packName.toLowerCase()] || 'blue';
  };

  if (isLoading) {
    return (
      <div className="subscription-plans-container">
        <div className="loading-state">Loading subscription plans...</div>
      </div>
    );
  }

  if (error && packs.length === 0) {
    return (
      <div className="subscription-plans-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-plans-container">
      <div className="subscription-header">
        <h1 className="subscription-title">Subscription Plans & Billing</h1>
        <p className="subscription-subtitle">Choose the perfect plan for your recruitment needs.</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="packs-grid">
        {packs.map((pack) => {
          const badge = getPackBadge(pack.name);
          const buttonColor = getButtonColor(pack.name);
          const features = getPackFeatures(pack);
          const description = getPackDescription(pack.name);
          const rawPrice = typeof pack.price === 'number' ? pack.price : parseFloat(String(pack.price));
          const price = Number.isFinite(rawPrice) ? rawPrice : 0;

          return (
            <div key={pack.id} className={`pack-card ${pack.name.toLowerCase()}`}>
              {badge && (
                <div className={`pack-badge ${badge.color}`}>
                  {badge.text}
                </div>
              )}
              
              <div className="pack-header">
                <h2 className="pack-name">{pack.name.toUpperCase()}</h2>
                <div className="pack-price">
                  <span className="price-amount">${price.toFixed(2)}</span>
                  <span className="price-period">/month</span>
                </div>
                <p className="pack-description">{description}</p>
              </div>

              <div className="pack-features">
                {features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">{feature.icon}</span>
                    <span className="feature-text">{feature.text}</span>
                  </div>
                ))}
              </div>

              <button
                className={`subscribe-btn ${buttonColor}`}
                onClick={() => handleSubscribe(pack)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;

