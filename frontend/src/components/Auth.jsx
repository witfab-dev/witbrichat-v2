import React, { useState, useEffect } from "react";
import { 
  IoEyeOutline, 
  IoEyeOffOutline, 
  IoMailOutline, 
  IoPersonOutline,
  IoLockClosedOutline,
  IoLogoGoogle,
  IoLogoFacebook,
  IoSparkles,
  IoCheckmarkCircle,
  IoAlertCircle
} from "react-icons/io5";
import './Auth.css';

function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "",
    confirmPassword: "" 
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Password strength calculator
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Length check
    if (formData.password.length >= 8) strength += 25;
    
    // Lowercase check
    if (/[a-z]/.test(formData.password)) strength += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(formData.password)) strength += 25;
    
    // Number/Special char check
    if (/[0-9!@#$%^&*]/.test(formData.password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  // Check if passwords match (for registration)
  const passwordsMatch = isRegistering 
    ? formData.password === formData.confirmPassword 
    : true;

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return "#10b981"; // Green
    if (passwordStrength >= 50) return "#f59e0b"; // Yellow
    if (passwordStrength >= 25) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength >= 75) return "Strong";
    if (passwordStrength >= 50) return "Medium";
    if (passwordStrength >= 25) return "Weak";
    return "Very Weak";
  };

  const validateForm = () => {
    setError("");
    setSuccess("");

    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }

    if (isRegistering) {
      if (!formData.email.trim()) {
        setError("Email is required");
        return false;
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }

      if (!passwordsMatch) {
        setError("Passwords do not match");
        return false;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const endpoint = isRegistering ? '/register' : '/login';
      const requestBody = isRegistering 
        ? { 
            username: formData.username, 
            password: formData.password, 
            email: formData.email 
          }
        : { 
            username: formData.username, 
            password: formData.password 
          };
      
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Authentication failed: ${response.status}`);
      }
      
      console.log(`${isRegistering ? 'Registration' : 'Login'} successful:`, data);
      
      if (!isRegistering && onLogin) {
        onLogin(data);
      }
      
      if (isRegistering) {
        setSuccess("🎉 Registration successful! You can now log in.");
        setIsRegistering(false);
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError')) {
        setError('🌐 Cannot connect to server. Please check if backend is running on port 3001.');
      } else {
        setError(`❌ ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setError(`⚠️ ${provider} login is coming soon!`);
  };

  const handleDemoLogin = () => {
    setFormData({
      username: "testuser",
      email: "",
      password: "password123",
      confirmPassword: ""
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-gradient-bg"></div>
      
      <div className="auth-card-wrapper">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="logo-container">
              <IoSparkles className="logo-sparkle" />
              <h1 className="app-logo">WitbriChat</h1>
              <IoSparkles className="logo-sparkle" />
            </div>
            <p className="auth-subtitle">
              {isRegistering 
                ? "Join our community and start connecting!" 
                : "Welcome back! Sign in to continue."}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="social-login-section">
            <button 
              className="social-btn google-btn"
              onClick={() => handleSocialLogin('Google')}
              type="button"
            >
              <IoLogoGoogle className="social-icon" />
              <span>Continue with Google</span>
            </button>
            
            <button 
              className="social-btn facebook-btn"
              onClick={() => handleSocialLogin('Facebook')}
              type="button"
            >
              <IoLogoFacebook className="social-icon" />
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="divider-section">
            <span className="divider-line"></span>
            <span className="divider-text">OR</span>
            <span className="divider-line"></span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username Input */}
            <div className="input-group">
              <IoPersonOutline className="input-icon" />
              <input
                className="auth-input"
                type="text"
                placeholder="Username"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isLoading}
              />
              {formData.username.length >= 3 && (
                <IoCheckmarkCircle className="input-success-icon" />
              )}
            </div>

            {/* Email Input - ONLY shows when Registering */}
            {isRegistering && (
              <div className="input-group">
                <IoMailOutline className="input-icon" />
                <input
                  className="auth-input"
                  type="email"
                  placeholder="Email address"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
                {/\S+@\S+\.\S+/.test(formData.email) && (
                  <IoCheckmarkCircle className="input-success-icon" />
                )}
              </div>
            )}
            
            {/* Password Input */}
            <div className="input-group">
              <IoLockClosedOutline className="input-icon" />
              <div className="password-container">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setShowPasswordRequirements(false)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {formData.password && (
                <div className="password-strength-meter">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span className="strength-text">
                    Strength: <strong>{getPasswordStrengthText()}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Input - ONLY shows when Registering */}
            {isRegistering && (
              <div className="input-group">
                <IoLockClosedOutline className="input-icon" />
                <div className="password-container">
                  <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                  />
                  {passwordsMatch && formData.confirmPassword && (
                    <IoCheckmarkCircle className="input-success-icon" />
                  )}
                </div>
                {!passwordsMatch && formData.confirmPassword && (
                  <div className="input-error-message">
                    <IoAlertCircle /> Passwords do not match
                  </div>
                )}
              </div>
            )}

            {/* Password Requirements Tooltip */}
            {showPasswordRequirements && isRegistering && (
              <div className="password-requirements">
                <h4>Password Requirements:</h4>
                <ul>
                  <li className={formData.password.length >= 8 ? "met" : ""}>
                    At least 8 characters
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? "met" : ""}>
                    One lowercase letter
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? "met" : ""}>
                    One uppercase letter
                  </li>
                  <li className={/[0-9!@#$%^&*]/.test(formData.password) ? "met" : ""}>
                    One number or special character
                  </li>
                </ul>
              </div>
            )}

            {/* Remember Me & Forgot Password (Login only) */}
            {!isRegistering && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-password-btn">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="message-box error-box">
                <IoAlertCircle className="message-icon" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="message-box success-box">
                <IoCheckmarkCircle className="message-icon" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || (isRegistering && !passwordsMatch)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading ? (
                <div className="spinner-container">
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  {isRegistering ? 'Create Account' : 'Sign In'}
                  {isHovered && <span className="btn-arrow">→</span>}
                </>
              )}
            </button>

            {/* Demo Login Button */}
            {!isRegistering && (
              <button 
                type="button"
                className="demo-login-btn"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Try Demo Account
              </button>
            )}
          </form>

          {/* Toggle between Login/Register */}
          <div className="auth-toggle">
            <p>
              {isRegistering ? "Already have an account?" : "Don't have an account?"}
              <button 
                type="button"
                className="toggle-link"
                onClick={() => { 
                  setIsRegistering(!isRegistering); 
                  setError(""); 
                  setSuccess("");
                  setFormData({ 
                    username: "", 
                    email: "", 
                    password: "", 
                    confirmPassword: "" 
                  });
                }}
                disabled={isLoading}
              >
                {isRegistering ? " Sign In" : " Sign Up"}
              </button>
            </p>
          </div>

          {/* Terms & Privacy (Registration only) */}
          {isRegistering && (
            <div className="terms-section">
              <p className="terms-text">
                By signing up, you agree to our 
                <button type="button" className="terms-link"> Terms of Service</button> 
                and 
                <button type="button" className="terms-link"> Privacy Policy</button>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="auth-footer">
            <p className="footer-text">
              © 2024 WitbriChat. All rights reserved.
            </p>
            <p className="footer-version">
              Version 1.0.0 • Made with ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;