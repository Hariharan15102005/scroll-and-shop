import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Lock, User, Mail, AlertCircle, ShoppingBag, ArrowRight, ShieldCheck, KeyRound, UserPlus } from 'lucide-react';
import { PasswordInputWithStrength } from './PasswordInputWithStrength';

export const AuthRequiredModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalActionName, login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key press & prevent body scroll
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleNavigateToPage = (path: string) => {
    sessionStorage.setItem('auth_redirect', window.location.pathname + window.location.search);
    closeAuthModal();
    navigate(path);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError('Please enter your username or email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (!isPasswordValid) {
      setError('Please choose a stronger password meeting the security requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim() || undefined,
        fullName: fullName.trim() || undefined,
        password,
        confirmPassword,
        agreeTerms,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please choose another username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={closeAuthModal}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* Brand Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #131921 0%, #232f3e 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #ff9900',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #ff9900, #ff5500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '16px',
                color: '#ffffff',
              }}
            >
              S
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', lineHeight: 1.1 }}>Scroll &amp; Shop</div>
              <div style={{ fontSize: '10px', color: '#ff9900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Social Commerce
              </div>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            aria-label="Close dialog"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Core Title & Message */}
        <div style={{ padding: '20px 24px 12px 24px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#fff4e5',
              color: '#ff9900',
              marginBottom: '10px',
            }}
          >
            <Lock size={22} />
          </div>
          <h2 id="auth-modal-title" style={{ fontSize: '20px', fontWeight: 800, color: '#0f1111', margin: '0 0 6px 0' }}>
            Sign in to continue
          </h2>
          <p style={{ fontSize: '13px', color: '#565959', lineHeight: 1.4, margin: 0 }}>
            Create an account or sign in to shop, connect with friends, and interact with the community.
          </p>

          {authModalActionName && authModalActionName !== 'continue' && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#0369a1',
                fontWeight: 600,
              }}
            >
              🔒 Required to {authModalActionName}
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', margin: '0 24px' }}>
          <button
            type="button"
            onClick={() => {
              setTab('LOGIN');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              borderBottom: tab === 'LOGIN' ? '2px solid #ff9900' : '2px solid transparent',
              color: tab === 'LOGIN' ? '#0f1111' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('REGISTER');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              borderBottom: tab === 'REGISTER' ? '2px solid #ff9900' : '2px solid transparent',
              color: tab === 'REGISTER' ? '#0f1111' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '18px 24px 24px 24px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {tab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Username or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username or email"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#ff9900')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Password</label>
                  <button
                    type="button"
                    onClick={() => handleNavigateToPage('/login')}
                    style={{ background: 'none', border: 'none', color: '#007185', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#ff9900')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                </div>
              </div>

              {/* Demo Accounts Pill List */}
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Quick Demo Login (Password: <code>password123</code>):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { u: 'john_doe', label: 'Customer (john_doe)' },
                    { u: 'sara_tech', label: 'Creator (sara_tech)' },
                    { u: 'admin', label: 'Admin (admin)' },
                  ].map((item) => (
                    <button
                      key={item.u}
                      type="button"
                      onClick={() => {
                        setIdentifier(item.u);
                        setPassword('password123');
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#ff9900';
                        e.currentTarget.style.color = '#ff9900';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#334155';
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="nav-btn-signup"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? 'Signing In...' : 'Sign In & Resume Action'}
                {!loading && <ArrowRight size={16} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                Prefer full page?{' '}
                <button
                  type="button"
                  onClick={() => handleNavigateToPage('/login')}
                  style={{ background: 'none', border: 'none', color: '#007185', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Open Sign In Page
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. john_doe"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <PasswordInputWithStrength
                password={password}
                confirmPassword={confirmPassword}
                username={username}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                showConfirmPassword={true}
                onValidityChange={(valid) => setIsPasswordValid(valid)}
                disabled={loading}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
                <input
                  type="checkbox"
                  id="modalAgreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ marginTop: '2px' }}
                />
                <label htmlFor="modalAgreeTerms" style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.3 }}>
                  I agree to Scroll &amp; Shop Terms of Service and Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="nav-btn-signup"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account & Continue'}
                {!loading && <ArrowRight size={16} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                Prefer full page?{' '}
                <button
                  type="button"
                  onClick={() => handleNavigateToPage('/register')}
                  style={{ background: 'none', border: 'none', color: '#007185', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Open Registration Page
                </button>
              </div>
            </form>
          )}

          {/* Continue browsing button */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <button
              type="button"
              onClick={closeAuthModal}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                color: '#64748b',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Continue browsing as Guest without signing in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
