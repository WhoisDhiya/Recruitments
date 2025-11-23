import React, { useState } from 'react';
import './SignIn.css';
import type { SignInProps } from '../types';
import { apiService } from '../services/api';

const SignIn: React.FC<SignInProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await apiService.login({ email, password });
      onLogin(response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string): void => {
    console.log(`Sign in with ${provider}`);
  };

  return (
    <div className="signin-container">
      {/* Left Section - Sign In Form */}
      <div className="signin-form-section">
        <div className="signin-form-container">
          {/* Logo */}
          <div className="logo-container">
            <div className="logo-icon">💼</div>
            <h1 className="logo-text">RecruPlus</h1>
          </div>

          {/* Sign In Form */}
          <div className="form-container">
            <h2 className="signin-title">Sign in</h2>
            
            {error && (
              <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            
            <p className="signup-link-text">
              Don't have account? <a href="/signup" className="signup-link">Create Account</a>
            </p>

            <form onSubmit={handleSubmit} className="signin-form">
              {/* Email Input */}
              <div className="input-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember Me
                </label>
                <a href="#" className="forgot-password">Forget password</a>
              </div>

              {/* Sign In Button */}
              <button type="submit" className="signin-button" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Sign In'}
                <span className="button-arrow">{isLoading ? '⏳' : '→'}</span>
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span className="divider-text">or</span>
            </div>

            {/* Social Sign In Buttons */}
            <div className="social-buttons">
              <button 
                className="social-button facebook-button"
                onClick={() => handleSocialSignIn('Facebook')}
              >
                <span className="social-icon facebook-icon">f</span>
                Sign in with Facebook
              </button>
              
              <button 
                className="social-button google-button"
                onClick={() => handleSocialSignIn('Google')}
              >
                <span className="social-icon google-icon">G</span>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Statistics */}
      <div className="stats-section">
        <div className="stats-content">
          <h2 className="stats-title">
            Over 1,75,324 candidates waiting for good employees.
          </h2>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">💼</div>
              <div className="stat-number">1,75,324</div>
              <div className="stat-label">Live Job</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">🏢</div>
              <div className="stat-number">97,354</div>
              <div className="stat-label">Companies</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">💼</div>
              <div className="stat-number">7,532</div>
              <div className="stat-label">New Jobs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
