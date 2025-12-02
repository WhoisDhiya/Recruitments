import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

const PaymentRequired: React.FC = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState<any[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Get recruiter ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const recruiter = JSON.parse(localStorage.getItem('recruiter') || '{}');
  const recruiterId = recruiter?.id || user?.id;

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setIsLoadingPacks(true);
      const packsData = await apiService.getPacks();
      
      if (packsData && packsData.length > 0) {
        const sortedPacks = packsData.sort((a: any, b: any) => {
          const order: Record<string, number> = { basic: 1, standard: 2, premium: 3 };
          return (order[a.name] || 999) - (order[b.name] || 999);
        });
        setPacks(sortedPacks);
      }
    } catch (err) {
      console.error('Error loading packs:', err);
      setMessage('Failed to load subscription plans. Please try again later.');
    } finally {
      setIsLoadingPacks(false);
    }
  };

  const handleSelectPack = async (packId: number) => {
    if (!recruiterId) {
      setMessage('Error: Recruiter ID not found. Please sign out and sign in again.');
      return;
    }

    if (isProcessingPayment) return;

    try {
      setIsProcessingPayment(true);
      setMessage(null);

      const { url } = await apiService.createCheckoutSession(recruiterId, packId);
      window.location.href = url;
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setMessage(err.message || 'Failed to initiate payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-red-500/20 border border-red-500/50 rounded-full p-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Active Subscription Required</h1>
          <p className="text-xl text-slate-300">
            To access your recruiter dashboard and post job offers, you need an active subscription plan.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{message}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoadingPacks ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="mt-4 text-slate-400">Loading subscription plans...</p>
          </div>
        ) : (
          <>
            {/* Packs Grid */}
            {packs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    className="relative bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-8 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 group"
                  >
                    {/* Badge */}
                    {pack.name.toLowerCase() === 'standard' && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        RECOMMENDED
                      </div>
                    )}

                    {/* Pack Info */}
                    <h3 className="text-2xl font-bold text-white mb-2 capitalize">{pack.name}</h3>
                    <p className="text-slate-400 mb-6">{pack.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-white">
                        ${typeof pack.price === 'string' ? parseFloat(pack.price) : pack.price}
                      </div>
                      <p className="text-slate-400 text-sm mt-1">One-time payment</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center text-slate-300">
                        <span className="w-5 h-5 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white text-xs">✓</span>
                        {pack.job_limit >= 100 || pack.job_limit === 999 ? 'Unlimited Job Postings' : `${pack.job_limit} Job Postings`}
                      </li>
                      <li className="flex items-center text-slate-300">
                        <span className="w-5 h-5 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white text-xs">✓</span>
                        {pack.candidate_limit} Candidate Views
                      </li>
                      <li className="flex items-center text-slate-300">
                        <span className="w-5 h-5 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white text-xs">✓</span>
                        {pack.visibility_days} Days Visibility
                      </li>
                      <li className="flex items-center text-slate-300">
                        <span className="w-5 h-5 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white text-xs">✓</span>
                        Priority Support
                      </li>
                    </ul>

                    {/* Button */}
                    <button
                      onClick={() => handleSelectPack(pack.id)}
                      disabled={isProcessingPayment}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Subscribe Now
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">No subscription plans available at the moment.</p>
              </div>
            )}

            {/* Footer Info */}
            <div className="text-center text-slate-400 text-sm">
              <p>
                Once you complete your payment, your account will be fully activated and you can immediately start posting jobs and finding candidates.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentRequired;
