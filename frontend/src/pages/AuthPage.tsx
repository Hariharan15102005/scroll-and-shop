import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ArrowLeft, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

export const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, pendingIntent, clearPendingIntent } = useAuth();

  const modeParam = searchParams.get('mode') || 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    modeParam === 'register' ? 'register' : 'login'
  );

  const stateActionDesc = (location.state as any)?.actionDescription;
  const stateReturnUrl = (location.state as any)?.returnUrl;
  const actionDescription = stateActionDesc || pendingIntent?.actionDescription;
  const returnUrl = stateReturnUrl || pendingIntent?.returnUrl || sessionStorage.getItem('auth_redirect') || '/';

  useEffect(() => {
    if (modeParam === 'register' || modeParam === 'signup') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [modeParam]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl || '/');
    }
  }, [isAuthenticated, navigate, returnUrl]);

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setSearchParams({ mode: tab });
  };

  const handleCancelAndBrowse = () => {
    clearPendingIntent();
    navigate(returnUrl || '/');
  };

  return (
    <div style={{ minHeight: '80vh', padding: '30px 16px', maxWidth: '840px', margin: '0 auto' }}>
      {/* Brand Logo Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#111' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: '#ff9900',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '24px',
                boxShadow: '0 2px 8px rgba(255,153,0,0.3)',
              }}
            >
              S
            </div>
            <span style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>Scroll &amp; Shop</span>
          </div>
        </Link>
      </div>

      {/* Guest Action Interceptor Banner */}
      {actionDescription && (
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: '10px',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(249,115,22,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Lock size={20} color="#ea580c" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#9a3412', marginBottom: '2px' }}>
                Authentication Required
              </div>
              <div style={{ fontSize: '13px', color: '#7c2d12', lineHeight: 1.4 }}>
                Please sign in or create an account to <strong>{actionDescription}</strong>. Your intended action will resume automatically.
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
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ArrowLeft size={13} /> Continue browsing as guest without signing in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modes Switcher */}
      <div
        style={{
          maxWidth: '560px',
          margin: '0 auto 24px auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '10px',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('login')}
          style={{
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: activeTab === 'login' ? 'white' : 'transparent',
            color: activeTab === 'login' ? '#0f172a' : '#64748b',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            borderRadius: '8px',
            boxShadow: activeTab === 'login' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <LogIn size={17} color={activeTab === 'login' ? '#ea580c' : '#64748b'} />
          Sign In
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('register')}
          style={{
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: activeTab === 'register' ? 'white' : 'transparent',
            color: activeTab === 'register' ? '#0f172a' : '#64748b',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            borderRadius: '8px',
            boxShadow: activeTab === 'register' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <UserPlus size={17} color={activeTab === 'register' ? '#ea580c' : '#64748b'} />
          Create Account
        </button>
      </div>

      {/* Render Active Component */}
      <div>
        {activeTab === 'login' ? (
          <LoginPage />
        ) : (
          <RegisterPage />
        )}
      </div>
    </div>
  );
};
