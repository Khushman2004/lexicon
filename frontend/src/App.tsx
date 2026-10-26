import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { libraryApi, type Word, type Phrase, type LibrarySummary, type User } from './api/client';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { AlphabetBar } from './components/AlphabetBar';
import { FilterBar, type FilterState } from './components/FilterBar';
import { WordCard } from './components/WordCard';
import { PhraseCard } from './components/PhraseCard';
import { WordModal } from './components/WordModal';
import { PhraseModal } from './components/PhraseModal';
import { AuthModal } from './components/AuthModal';
import { ExploreMembers } from './components/ExploreMembers';
import { BookOpen, Sparkles, Plus, Sparkle, RefreshCw } from 'lucide-react';

function LexiconMain() {
  const { user } = useAuth();

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'words' | 'phrases' | 'explore'>('words');
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Data State
  const [words, setWords] = useState<Word[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [summary, setSummary] = useState<LibrarySummary | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter State (Default: Automatic Alphabetical Sorting)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    datePreset: 'all',
    fromDate: '',
    toDate: '',
    sortOrder: 'alpha-asc',
  });

  // Modal State
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [isPhraseModalOpen, setIsPhraseModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeUserId = viewingUser ? viewingUser.id : user?.id;
  const isOwner = !viewingUser || (user ? user.id === viewingUser.id : false);

  // Fetch Summary Stats
  const fetchSummary = useCallback(async () => {
    if (!activeUserId) return;
    try {
      const res = viewingUser
        ? await libraryApi.getUserSummary(viewingUser.id)
        : await libraryApi.getMySummary();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.warn('Could not load summary stats', err);
    }
  }, [activeUserId, viewingUser]);

  // Fetch Items (Words or Phrases)
  const fetchData = useCallback(async () => {
    if (currentTab === 'explore') return;

    setLoading(true);
    const params = {
      userId: activeUserId,
      search: filters.search || undefined,
      startingLetter: selectedLetter || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      sortOrder: filters.sortOrder,
      page: 1,
      pageSize: 50,
    };

    try {
      if (currentTab === 'words') {
        const res = await libraryApi.getWords(params);
        if (res.success && res.data) {
          setWords(res.data.items);
          setTotalCount(res.data.totalCount);
        }
      } else if (currentTab === 'phrases') {
        const res = await libraryApi.getPhrases(params);
        if (res.success && res.data) {
          setPhrases(res.data.items);
          setTotalCount(res.data.totalCount);
        }
      }
    } catch (err) {
      console.error('Error fetching library data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTab, activeUserId, filters, selectedLetter]);

  useEffect(() => {
    fetchData();
    fetchSummary();
  }, [fetchData, fetchSummary]);

  // Handle Add/Edit Word
  const handleSaveWord = async (data: any) => {
    if (editingWord) {
      const res = await libraryApi.updateWord(editingWord.id, data);
      if (res.success) {
        showToast(`"${data.term}" updated successfully.`);
      }
    } else {
      const res = await libraryApi.createWord(data);
      if (res.success) {
        showToast(`"${data.term}" added to your dictionary.`);
      }
    }
    setEditingWord(null);
    fetchData();
    fetchSummary();
  };

  // Handle Delete Word
  const handleDeleteWord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this word from your dictionary?')) {
      const res = await libraryApi.deleteWord(id);
      if (res.success) {
        showToast('Word removed from dictionary.');
        fetchData();
        fetchSummary();
      }
    }
  };

  // Handle Add/Edit Phrase
  const handleSavePhrase = async (data: any) => {
    if (editingPhrase) {
      const res = await libraryApi.updatePhrase(editingPhrase.id, data);
      if (res.success) {
        showToast(`"${data.phraseText}" updated successfully.`);
      }
    } else {
      const res = await libraryApi.createPhrase(data);
      if (res.success) {
        showToast(`"${data.phraseText}" added to your collection.`);
      }
    }
    setEditingPhrase(null);
    fetchData();
    fetchSummary();
  };

  // Handle Delete Phrase
  const handleDeletePhrase = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this phrase from your collection?')) {
      const res = await libraryApi.deletePhrase(id);
      if (res.success) {
        showToast('Phrase removed from collection.');
        fetchData();
        fetchSummary();
      }
    }
  };

  // Open Modal Helpers
  const handleOpenAddModal = (type: 'word' | 'phrase') => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (type === 'word') {
      setEditingWord(null);
      setIsWordModalOpen(true);
    } else {
      setEditingPhrase(null);
      setIsPhraseModalOpen(true);
    }
  };

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
    setIsWordModalOpen(true);
  };

  const handleEditPhrase = (phrase: Phrase) => {
    setEditingPhrase(phrase);
    setIsPhraseModalOpen(true);
  };

  const handleSelectUserToExplore = (selectedUser: User) => {
    if (user && selectedUser.id === user.id) {
      setViewingUser(null);
    } else {
      setViewingUser(selectedUser);
    }
    setCurrentTab('words');
    setSelectedLetter(null);
  };

  const handleBackToMyLibrary = () => {
    setViewingUser(null);
    setCurrentTab('words');
    setSelectedLetter(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: 'rgba(16, 24, 40, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px',
          color: '#ffffff',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
        }}>
          <Sparkle size={18} color="#818cf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setSelectedLetter(null);
        }}
        onOpenAddModal={handleOpenAddModal}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        viewingOtherUser={viewingUser ? { id: viewingUser.id, username: viewingUser.username } : null}
        onBackToMyLibrary={handleBackToMyLibrary}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {/* Banner if exploring another member's library */}
        {viewingUser && (
          <div className="glass-panel" style={{
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={viewingUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                alt={viewingUser.username}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: 18, color: '#ffffff', margin: 0 }}>
                  Exploring {viewingUser.fullName || viewingUser.username}&apos;s Public Lexicon
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                  @{viewingUser.username} &bull; {viewingUser.bio || 'Curator of language'}
                </p>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={handleBackToMyLibrary} style={{ fontSize: 12 }}>
              Back to My Library
            </button>
          </div>
        )}

        {/* View Switcher: Community Explorer vs Personal Library */}
        {currentTab === 'explore' ? (
          <ExploreMembers
            onSelectUserToExplore={handleSelectUserToExplore}
            currentUserId={user?.id}
          />
        ) : (
          <>
            {/* Not Authenticated & No user selected state */}
            {!user && !viewingUser ? (
              <div className="glass-panel" style={{
                textAlign: 'center',
                padding: '60px 24px',
                marginBottom: 32,
                background: 'linear-gradient(135deg, rgba(20, 25, 45, 0.7) 0%, rgba(10, 15, 30, 0.9) 100%)',
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                  marginBottom: 16,
                }}>
                  <BookOpen size={32} />
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
                  Your Personal Language Architecture
                </h2>
                <p style={{
                  fontSize: 15,
                  color: 'var(--text-secondary)',
                  maxWidth: 580,
                  margin: '0 auto 24px',
                  lineHeight: 1.6,
                }}>
                  Catalog rare vocabulary and expressive idioms. Automatically organized alphabetically, filterable by date, and shared with friends across microservices.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsAuthModalOpen(true)}
                    style={{ padding: '10px 24px', fontSize: 14 }}
                  >
                    Get Started (Sign In / Demo)
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentTab('explore')}
                    style={{ padding: '10px 24px', fontSize: 14 }}
                  >
                    Browse Community Libraries
                  </button>
                </div>
              </div>
            ) : null}

            {/* Stats Summary Bar */}
            <StatsBanner
              summary={summary}
              username={viewingUser?.username || user?.username}
              isOtherUser={!!viewingUser}
            />

            {/* Alphabet Quick Jump A-Z Bar */}
            <AlphabetBar
              selectedLetter={selectedLetter}
              onSelectLetter={(letter) => setSelectedLetter(letter)}
            />

            {/* Filter, Search & Datetime Bar */}
            <FilterBar
              filters={filters}
              onChange={(newFilters) => setFilters(newFilters)}
              totalCount={totalCount}
              itemType={currentTab}
            />

            {/* Content Cards Grid */}
            {loading ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 0',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}>
                <RefreshCw size={18} className="animate-spin" />
                <span>Loading your curated {currentTab}...</span>
              </div>
            ) : currentTab === 'words' ? (
              /* Words Tab View */
              words.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <BookOpen size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: 18, color: '#ffffff', marginBottom: 6 }}>
                    No words found in this view
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    {filters.search || selectedLetter || filters.datePreset !== 'all'
                      ? 'Try clearing the search or date filters.'
                      : isOwner
                      ? 'Start building your dictionary by adding your first word!'
                      : 'This user has not made any words public yet.'}
                  </p>
                  {isOwner && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleOpenAddModal('word')}
                    >
                      <Plus size={16} /> Add First Word
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: 20,
                }}>
                  {words.map((word) => (
                    <WordCard
                      key={word.id}
                      word={word}
                      isOwner={isOwner}
                      onEdit={handleEditWord}
                      onDelete={handleDeleteWord}
                    />
                  ))}
                </div>
              )
            ) : (
              /* Phrases Tab View */
              phrases.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Sparkles size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: 18, color: '#ffffff', marginBottom: 6 }}>
                    No phrases found in this view
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    {filters.search || selectedLetter || filters.datePreset !== 'all'
                      ? 'Try clearing the search or date filters.'
                      : isOwner
                      ? 'Catalog memorable idioms and dialogue phrases!'
                      : 'This user has not made any phrases public yet.'}
                  </p>
                  {isOwner && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleOpenAddModal('phrase')}
                    >
                      <Plus size={16} /> Add First Phrase
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: 20,
                }}>
                  {phrases.map((phrase) => (
                    <PhraseCard
                      key={phrase.id}
                      phrase={phrase}
                      isOwner={isOwner}
                      onEdit={handleEditPhrase}
                      onDelete={handleDeletePhrase}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-glass)',
        padding: '24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-muted)',
        background: 'rgba(7, 9, 14, 0.9)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <strong>LEXICON</strong> &bull; Microservice Architecture Platform (.NET 9 &bull; YARP Gateway &bull; React TSX)
          </div>
          <div>
            API Gateway: <code>http://localhost:5000</code> &bull; Auth: <code>:5001</code> &bull; Library: <code>:5002</code>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WordModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        onSubmit={handleSaveWord}
        initialData={editingWord}
      />

      <PhraseModal
        isOpen={isPhraseModalOpen}
        onClose={() => setIsPhraseModalOpen(false)}
        onSubmit={handleSavePhrase}
        initialData={editingPhrase}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LexiconMain />
    </AuthProvider>
  );
}
