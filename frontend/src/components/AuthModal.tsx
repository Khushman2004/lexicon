import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(usernameOrEmail, password);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await register({
      username,
      email,
      password,
      fullName: fullName.trim() || undefined,
      bio: bio.trim() || undefined,
    });
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  const fillDemoAccount = () => {
    setMode('login');
    setUsernameOrEmail('demo');
    setPassword('Password123!');
    clearError();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 12, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16,
    }}>
      <div className="glass-panel animate-slide-down" style={{
        maxWidth: 440,
        width: '100%',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          title="Close"
          style={{ position: 'absolute', right: 20, top: 20 }}
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-500) 0%, #4338ca 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
          }}>
            <Lock size={24} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff' }}>
            {mode === 'login' ? 'Welcome to Lexicon' : 'Create Your Lexicon'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {mode === 'login'
              ? 'Sign in to access your personal words and phrases library'
              : 'Join the community of lexicographers and language collectors'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          background: 'rgba(255, 255, 255, 0.04)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
        }}>
          <button
            onClick={() => { setMode('login'); clearError(); }}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              border: 'none',
              background: mode === 'login' ? 'var(--primary-500)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); clearError(); }}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              border: 'none',
              background: mode === 'register' ? 'var(--primary-500)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            Register
          </button>
        </div>

        {/* Quick Demo Fill Helper */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#c7d2fe' }}>
            <Sparkles size={16} color="#818cf8" />
            <span>Seed demo credentials available</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAccount}
            style={{
              background: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Fill Demo
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: '#fb7185',
            fontSize: 13,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="demo or demo@lexicon.app"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Password123!"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8, padding: 12 }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Choose unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Maya Angelou"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Collector of archaic and scientific words"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8, padding: 12 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
