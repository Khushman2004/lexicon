import React, { useState, useEffect } from 'react';
import { authApi, type User } from '../api/client';
import { Search, UserCheck, BookOpen, Calendar, Sparkles } from 'lucide-react';

interface ExploreMembersProps {
  onSelectUserToExplore: (user: User) => void;
  currentUserId?: string;
}

export const ExploreMembers: React.FC<ExploreMembersProps> = ({ onSelectUserToExplore, currentUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await authApi.getUsers(search || undefined, 1, 24);
      if (res.success && res.data) {
        setUsers(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load community users', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
      }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a5b4fc', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            <Sparkles size={16} /> Community Lexicographers
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
            Explore Fellow Word Curators
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Discover dictionaries created by other users, browse their rare words and phrases, and connect with language explorers across the platform.
          </p>
        </div>

        {/* Search */}
        <div style={{ marginTop: 20, maxWidth: 420, position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search members by username, name, bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading community curators...
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <UserCheck size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, color: '#ffffff', marginBottom: 6 }}>No Members Found</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {users.map((member) => {
            const isSelf = currentUserId === member.id;
            const joinDate = new Date(member.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
            });

            return (
              <div key={member.id} className="glass-panel glass-panel-hover" style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  {/* Avatar and Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <img
                      src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={member.username}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(99, 102, 241, 0.4)',
                      }}
                    />
                    <div>
                      <h4 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff' }}>
                        {member.fullName || member.username}
                      </h4>
                      <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>
                        @{member.username}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    minHeight: 40,
                    marginBottom: 16,
                  }}>
                    {member.bio || 'Curating language, words, and memorable phrases.'}
                  </p>
                </div>

                {/* Footer with action */}
                <div style={{
                  paddingTop: 14,
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    <span>Member since {joinDate}</span>
                  </div>

                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                    onClick={() => onSelectUserToExplore(member)}
                  >
                    <BookOpen size={13} color="#818cf8" />
                    {isSelf ? 'My Library' : 'Explore Library'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
