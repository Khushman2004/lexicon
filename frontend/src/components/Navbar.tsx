import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, Plus, LogOut, LogIn, Sparkles, Layers } from 'lucide-react';

interface NavbarProps {
  currentTab: 'words' | 'phrases' | 'explore';
  onTabChange: (tab: 'words' | 'phrases' | 'explore') => void;
  onOpenAddModal: (type: 'word' | 'phrase') => void;
  onOpenAuthModal: () => void;
  viewingOtherUser: { id: string; username: string } | null;
  onBackToMyLibrary: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  onOpenAuthModal,
  viewingOtherUser,
  onBackToMyLibrary,
}) => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-glass)',
      padding: '12px 24px',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {/* Brand Logo & Microservice Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }} onClick={onBackToMyLibrary}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            }}>
              <BookOpen size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em' }} className="gradient-text">
                  LEXICON
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  padding: '2px 7px',
                  borderRadius: 4,
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Layers size={10} /> Gateway &bull; Microservices
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Personal Dictionary & Community Library
              </p>
            </div>
          </div>
        </div>

        {/* Center Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255, 255, 255, 0.03)',
          padding: 4,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass)',
        }}>
          {viewingOtherUser ? (
            <button
              onClick={onBackToMyLibrary}
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#c7d2fe',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              &larr; Back to My Library
            </button>
          ) : (
            <>
              <button
                onClick={() => onTabChange('words')}
                style={{
                  background: currentTab === 'words' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: currentTab === 'words' ? '#ffffff' : 'var(--text-secondary)',
                  border: currentTab === 'words' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <BookOpen size={15} />
                Words Tab
              </button>
              <button
                onClick={() => onTabChange('phrases')}
                style={{
                  background: currentTab === 'phrases' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: currentTab === 'phrases' ? '#ffffff' : 'var(--text-secondary)',
                  border: currentTab === 'phrases' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Sparkles size={15} />
                Phrases Tab
              </button>
            </>
          )}

          <button
            onClick={() => onTabChange('explore')}
            style={{
              background: currentTab === 'explore' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: currentTab === 'explore' ? '#ffffff' : 'var(--text-secondary)',
              border: currentTab === 'explore' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              padding: '6px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Users size={15} />
            Explore Members
          </button>
        </nav>

        {/* User Actions & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              {/* Quick Add Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => onOpenAddModal('word')}
                  style={{ fontSize: 13, padding: '7px 14px' }}
                >
                  <Plus size={15} /> Add Word
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => onOpenAddModal('phrase')}
                  style={{ fontSize: 13, padding: '7px 14px' }}
                >
                  <Plus size={15} /> Add Phrase
                </button>
              </div>

              {/* User Avatar & Name */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 10px 4px 6px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-glass)',
              }}>
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.username}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  @{user.username}
                </span>
                <button
                  onClick={logout}
                  title="Sign out"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2,
                    marginLeft: 2,
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onOpenAuthModal}
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              <LogIn size={15} /> Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
