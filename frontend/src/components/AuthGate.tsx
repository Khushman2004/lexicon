import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Sparkles, BookOpen, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export const AuthGate: React.FC = () => {
  const { login, register, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(usernameOrEmail, password);
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await register({
      username,
      email,
      password,
      fullName: fullName.trim() || undefined,
      bio: bio.trim() || undefined,
    });
    setLoading(false);
  };

  const fillDemoAccount = () => {
    setMode('login');
    setUsernameOrEmail('demo');
    setPassword('Password123!');
    clearError();
  };

  return (
    <div style={{
      maxWidth: 960,
      margin: '40px auto',
      padding: '0 16px',
    }} className="animate-fade-in">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        alignItems: 'center',
      }}>
        {/* Left Column: Security & Privacy Gate Info */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            <Lock size={13} /> Protected Architecture
          </div>

          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1.2,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            marginBottom: 16,
          }}>
            Sign In to Unlock Your Personal &amp; Community Lexicon
          </h1>

          <p style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 24,
          }}>
            To guarantee strict data security and privacy, all personal dictionaries and community network libraries require an authenticated session.
          </p>

          {/* Highlights List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                flexShrink: 0,
              }}>
                <BookOpen size={16} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#ffffff' }}>Personal Cataloging</strong>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  Curate words and idioms automatically sorted alphabetically (A-Z) with datetime tracking.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                flexShrink: 0,
              }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#ffffff' }}>Strict JWT Protection</strong>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  Stateless signed JWTs validate all requests across the YARP microservices gateway.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                flexShrink: 0,
              }}>
                <Layers size={16} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#ffffff' }}>Explore Community Curators</strong>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  Browse public collections shared by fellow members and prepare for social friends and chat.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="glass-panel" style={{
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}>
          {/* Card Tabs: Sign In vs Register */}
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
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
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
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                border: 'none',
                background: mode === 'register' ? 'var(--primary-500)' : 'transparent',
                color: mode === 'register' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Helper */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#c7d2fe' }}>
              <Sparkles size={16} color="#818cf8" />
              <span>Instant Local Demo</span>
            </div>
            <button
              type="button"
              onClick={fillDemoAccount}
              style={{
                background: 'rgba(99, 102, 241, 0.25)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Fill Demo <ArrowRight size={12} />
            </button>
          </div>

          {/* Error Message */}
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

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Password123!"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 10, padding: 12, fontSize: 14 }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Lexicon'}
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
                  placeholder="Unique username"
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
                  placeholder="you@domain.com"
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
                  placeholder="Your display name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Lexicography interests / favorites"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 10, padding: 12, fontSize: 14 }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register & Unlock'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
