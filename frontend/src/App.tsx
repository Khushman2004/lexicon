import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { libraryApi, type Word, type Phrase, type LibrarySummary, type User } from './api/client';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { AlphabetBar } from './components/AlphabetBar';
import { FilterBar, type FilterState } from './components/FilterBar';
import { ViewControlsBar } from './components/ViewControlsBar';
import { TableView, type DisplayItem } from './components/TableView';
import { WordCard } from './components/WordCard';
import { PhraseCard } from './components/PhraseCard';
import { WordModal } from './components/WordModal';
import { PhraseModal } from './components/PhraseModal';
import { AuthModal } from './components/AuthModal';
import { AuthGate } from './components/AuthGate';
import { ExploreMembers } from './components/ExploreMembers';
import { BookOpen, Plus, Sparkle, RefreshCw, TrendingUp, X } from 'lucide-react';

function LexiconMain() {
  const { user, loading: authLoading } = useAuth();

  // Navigation: 'library' or 'explore'
  const [currentNav, setCurrentNav] = useState<'library' | 'explore'>('library');
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Active filter: 'all' | 'words' | 'phrases' (controlled by clicking stats boxes or "View All")
  const [activeFilter, setActiveFilter] = useState<'all' | 'words' | 'phrases'>('all');

  // View Mode: 'cards' or 'table' with user-configurable default preference in localStorage
  const [defaultView, setDefaultView] = useState<'cards' | 'table'>(() => {
    const saved = localStorage.getItem('lexicon_default_view');
    return saved === 'table' ? 'table' : 'cards';
  });
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(defaultView);

  // Data State
  const [words, setWords] = useState<Word[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [summary, setSummary] = useState<LibrarySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search, Alphabet & Datetime Filters (Default: Automatic Alphabetical Sorting)
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
    setTimeout(() => setToastMessage(null), 3200);
  };

  const isOwner = !viewingUser || (user ? user.id === viewingUser.id : false);

  // Handle Default View Preference Persistence
  const handleSetDefaultView = (mode: 'cards' | 'table') => {
    setDefaultView(mode);
    localStorage.setItem('lexicon_default_view', mode);
    showToast(`${mode === 'cards' ? 'Cards Grid' : 'Tabular Table'} view saved as your default preference.`);
  };

  // Fetch Summary Stats - strictly requires authentication
  const fetchSummary = useCallback(async () => {
    if (!user) {
      setSummary(null);
      return;
    }
    const targetUserId = viewingUser ? viewingUser.id : user.id;
    try {
      const res = viewingUser
        ? await libraryApi.getUserSummary(targetUserId)
        : await libraryApi.getMySummary();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.warn('Could not load summary stats', err);
    }
  }, [user, viewingUser]);

  // Fetch Items (Words and Phrases) - strictly requires authentication
  const fetchData = useCallback(async () => {
    if (!user) {
      setWords([]);
      setPhrases([]);
      return;
    }
    if (currentNav === 'explore') return;

    setLoading(true);
    const targetUserId = viewingUser ? viewingUser.id : user.id;
    const params = {
      userId: targetUserId,
      search: filters.search || undefined,
      startingLetter: selectedLetter || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      sortOrder: filters.sortOrder,
      page: 1,
      pageSize: 100,
    };

    try {
      // Fetch both concurrently to support 'all', 'words', and 'phrases' views seamlessly
      const [wordsRes, phrasesRes] = await Promise.all([
        libraryApi.getWords(params),
        libraryApi.getPhrases(params),
      ]);

      if (wordsRes.success && wordsRes.data) {
        setWords(wordsRes.data.items);
      }
      if (phrasesRes.success && phrasesRes.data) {
        setPhrases(phrasesRes.data.items);
      }
    } catch (err) {
      console.error('Error fetching library data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, currentNav, viewingUser, filters, selectedLetter]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchSummary();
    } else {
      setWords([]);
      setPhrases([]);
      setSummary(null);
      setViewingUser(null);
      setCurrentNav('library');
    }
  }, [user, fetchData, fetchSummary]);

  // Combine and Sort Display Items
  const displayItems: DisplayItem[] = useMemo(() => {
    const list: DisplayItem[] = [];

    if (activeFilter === 'all' || activeFilter === 'words') {
      list.push(...words.map(w => ({ type: 'word' as const, item: w })));
    }
    if (activeFilter === 'all' || activeFilter === 'phrases') {
      list.push(...phrases.map(p => ({ type: 'phrase' as const, item: p })));
    }

    // Sort items according to active sort order (Automatic Alphabetical A-Z by default)
    list.sort((a, b) => {
      const titleA = a.type === 'word' ? a.item.term : a.item.phraseText;
      const titleB = b.type === 'word' ? b.item.term : b.item.phraseText;

      if (filters.sortOrder === 'alpha-desc') {
        return titleB.localeCompare(titleA, undefined, { sensitivity: 'base' });
      } else if (filters.sortOrder === 'date-desc') {
        return new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime();
      } else if (filters.sortOrder === 'date-asc') {
        return new Date(a.item.createdAt).getTime() - new Date(b.item.createdAt).getTime();
      } else {
        // Default: alpha-asc
        return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
      }
    });

    return list;
  }, [words, phrases, activeFilter, filters.sortOrder]);

  // Word & Phrase Handlers
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
    setCurrentNav('library');
    setActiveFilter('all');
    setSelectedLetter(null);
  };

  const handleBackToMyLibrary = () => {
    setViewingUser(null);
    setCurrentNav('library');
    setActiveFilter('all');
    setSelectedLetter(null);
  };

  const handleWeeklyFilter = () => {
    if (filters.datePreset === '7days') {
      // Toggle off: clear weekly filter, restore full library
      setFilters(prev => ({
        ...prev,
        datePreset: 'all',
        fromDate: '',
        toDate: '',
      }));
      showToast('Cleared weekly filter. Displaying all entries.');
    } else {
      // Toggle on: display this week's added phrases and words
      const now = new Date();
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setActiveFilter('all'); // Crucial: ensure BOTH phrases and words are displayed!
      setSelectedLetter(null); // Clear letter jump filter so all weekly items are visible
      setFilters(prev => ({
        ...prev,
        datePreset: '7days',
        fromDate: past7.toISOString(),
        toDate: '',
      }));
      showToast("Displaying this current week's added phrases and words.");
    }
  };

  const handleTagFilter = (tag: string) => {
    setFilters(prev => ({ ...prev, search: tag }));
    showToast(`Filtering entries tagged #${tag}`);
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        gap: 16,
      }}>
        <RefreshCw size={32} className="animate-spin" color="#818cf8" />
        <p style={{ fontSize: 14 }}>Authenticating Lexicon session...</p>
      </div>
    );
  }

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

      {/* Navbar without explicit tab buttons */}
      <Navbar
        currentNav={currentNav}
        onNavChange={(nav) => {
          setCurrentNav(nav);
          setSelectedLetter(null);
        }}
        onOpenAddModal={handleOpenAddModal}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        viewingOtherUser={viewingUser ? { id: viewingUser.id, username: viewingUser.username } : null}
        onBackToMyLibrary={handleBackToMyLibrary}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {!user ? (
          <AuthGate />
        ) : (
          <>
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
        {currentNav === 'explore' ? (
          <ExploreMembers
            onSelectUserToExplore={handleSelectUserToExplore}
            currentUserId={user?.id}
          />
        ) : (
          <>
            {/* Clickable Stats Boxes - Clicking boxes filters display below */}
            <StatsBanner
              summary={summary}
              username={viewingUser?.username || user?.username}
              isOtherUser={!!viewingUser}
              activeFilter={activeFilter}
              onFilterChange={(f) => setActiveFilter(f)}
              onWeeklyFilter={handleWeeklyFilter}
              isWeeklyActive={filters.datePreset === '7days'}
              onSelectTag={handleTagFilter}
            />

            {/* Active Weekly Filter Banner */}
            {filters.datePreset === '7days' && (
              <div
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 18px',
                  marginBottom: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  fontSize: 13,
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrendingUp size={18} color="#fbbf24" />
                  <span>
                    Displaying <strong>{displayItems.length}</strong> {displayItems.length === 1 ? 'entry' : 'entries'} added in the current week (past 7 days) &bull; Words &amp; phrases
                  </span>
                </div>
                <button
                  onClick={handleWeeklyFilter}
                  style={{
                    background: 'rgba(245, 158, 11, 0.25)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: '#fef3c7',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <X size={13} /> Clear Weekly Filter
                </button>
              </div>
            )}

            {/* View Controls Bar: View All Option, Cards vs Table View toggles, and Set as Default choice */}
            <ViewControlsBar
              activeFilter={activeFilter}
              onFilterChange={(f) => setActiveFilter(f)}
              viewMode={viewMode}
              onViewModeChange={(m) => setViewMode(m)}
              defaultView={defaultView}
              onSetDefaultView={handleSetDefaultView}
              totalWords={words.length}
              totalPhrases={phrases.length}
              totalVisible={displayItems.length}
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
              totalCount={displayItems.length}
              itemType={activeFilter === 'words' ? 'words' : activeFilter === 'phrases' ? 'phrases' : 'entries'}
            />

            {/* Main Content: Card View vs Tabular View */}
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
                <span>Loading your curated language collection...</span>
              </div>
            ) : viewMode === 'table' ? (
              /* Tabular View */
              <TableView
                items={displayItems}
                isOwner={isOwner}
                onEditWord={handleEditWord}
                onDeleteWord={handleDeleteWord}
                onEditPhrase={handleEditPhrase}
                onDeletePhrase={handleDeletePhrase}
              />
            ) : (
              /* Cards Grid View */
              displayItems.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <BookOpen size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: 18, color: '#ffffff', marginBottom: 6 }}>
                    No entries found in this view
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    {filters.search || selectedLetter || filters.datePreset !== 'all'
                      ? 'Try clearing the search or date filters.'
                      : isOwner
                      ? 'Start cataloging words and phrases in your personal dictionary!'
                      : 'This user has not made any entries public yet.'}
                  </p>
                  {isOwner && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenAddModal('word')}
                      >
                        <Plus size={16} /> Add Word
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenAddModal('phrase')}
                      >
                        <Plus size={16} /> Add Phrase
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: 20,
                }}>
                  {displayItems.map((entry, idx) => (
                    entry.type === 'word' ? (
                      <WordCard
                        key={`word-${entry.item.id}-${idx}`}
                        word={entry.item}
                        isOwner={isOwner}
                        onEdit={handleEditWord}
                        onDelete={handleDeleteWord}
                      />
                    ) : (
                      <PhraseCard
                        key={`phrase-${entry.item.id}-${idx}`}
                        phrase={entry.item}
                        isOwner={isOwner}
                        onEdit={handleEditPhrase}
                        onDelete={handleDeletePhrase}
                      />
                    )
                  ))}
                </div>
              )
            )}
          </>
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
