import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, ShieldCheck, Eye, EyeOff, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, pendingIntent, clearPendingIntent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve pending action description & returnUrl
  const stateActionDesc = (location.state as any)?.actionDescription;
  const stateReturnUrl = (location.state as any)?.returnUrl;
  const actionDescription = stateActionDesc || pendingIntent?.actionDescription;
  const returnUrl = stateReturnUrl || pendingIntent?.returnUrl || sessionStorage.getItem('auth_redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const destination = await login(username, password);
      navigate(destination || returnUrl || '/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoUser: string) => {
    setUsername(demoUser);
    setPassword('password123');
    try {
      setIsLoading(true);
      setError(null);
      const destination = await login(demoUser, 'password123');
      navigate(destination || returnUrl || '/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAndBrowse = () => {
    clearPendingIntent();
    navigate(returnUrl || '/');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '30px auto', padding: '0 16px' }}>
      {/* Brand Logo Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#111' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: '#ff9900',
                color: 'white',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '22px',
                boxShadow: '0 2px 8px rgba(255,153,0,0.3)',
              }}
            >
              S
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>Scroll &amp; Shop</span>
          </div>
        </Link>
      </div>

      {/* Guest Action Interceptor Banner */}
      {actionDescription && (
        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: '8px',
            padding: '14px 16px',
            marginBottom: '18px',
            boxShadow: '0 2px 6px rgba(249,115,22,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Lock size={18} color="#ea580c" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412', marginBottom: '2px' }}>
                Sign In Required
              </div>
              <div style={{ fontSize: '12px', color: '#7c2d12', lineHeight: 1.4 }}>
                Please sign in to <strong>{actionDescription}</strong>. Your action will resume automatically once authenticated.
              </div>
              <button
                type="button"
                onClick={handleCancelAndBrowse}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007185',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ArrowLeft size={13} /> Continue browsing as guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Tabs: Sign In / Create Account */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          style={{
            padding: '10px',
            background: 'white',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'default',
          }}
        >
          Sign In
        </button>
        <Link
          to="/register"
          state={{ actionDescription, returnUrl }}
          style={{
            padding: '10px',
            textAlign: 'center',
            color: '#64748b',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
            borderRadius: '6px',
            transition: 'all 0.2s',
          }}
        >
          Create Account
        </Link>
      </div>

      <div
        style={{
          background: 'white',
          padding: '28px',
          borderRadius: '8px',
          border: '1px solid #d5d9d9',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        }}
      >
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', color: '#111' }}>Sign In</h1>

        {error && (
          <div
            style={{
              background: '#fdeded',
              border: '1px solid #f5c6cb',
              color: '#721c24',
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
              Username or Email
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex_tech or alex@example.com"
              required
              autoFocus
              style={{ padding: '10px 12px', fontSize: '14px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#333' }}>
                Password
              </label>
              <span style={{ fontSize: '12px', color: '#007185', cursor: 'pointer' }}>Forgot password?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ padding: '10px 40px 10px 12px', fontSize: '14px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '6px',
              backgroundColor: '#ff9900',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(255,153,0,0.25)',
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginTop: '22px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="#ea580c" /> 1-Click Fast Demo Logins:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: '11px', padding: '7px 8px', borderRadius: '6px' }}
              onClick={() => handleQuickDemoLogin('admin')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: '11px', padding: '7px 8px', borderRadius: '6px' }}
              onClick={() => handleQuickDemoLogin('alex_tech')}
            >
              🎥 Creator (Alex)
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: '11px', padding: '7px 8px', borderRadius: '6px' }}
              onClick={() => handleQuickDemoLogin('sarah_style')}
            >
              ✨ Creator (Sarah)
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: '11px', padding: '7px 8px', borderRadius: '6px' }}
              onClick={() => handleQuickDemoLogin('rohit_gamer')}
            >
              🎮 User (Rohit)
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>New to Scroll &amp; Shop?</div>
        <Link
          to="/register"
          state={{ actionDescription, returnUrl }}
          className="btn-outline"
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: '11px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '6px',
            textDecoration: 'none',
          }}
        >
          Create your Scroll &amp; Shop account (Customer / Seller)
        </Link>
      </div>
    </div>
  );
};
