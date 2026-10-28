import axios, { AxiosError } from 'axios';

// The Gateway is our unified microservice endpoint
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lexicon_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for token expiry / unauthenticated handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lexicon_token');
      window.dispatchEvent(new Event('lexicon:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface Word {
  id: string;
  userId: string;
  term: string;
  definition: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  tags?: string;
  notes?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Phrase {
  id: string;
  userId: string;
  phraseText: string;
  meaning: string;
  context?: string;
  tags?: string;
  notes?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface LibrarySummary {
  totalWords: number;
  totalPhrases: number;
  wordsAddedThisWeek: number;
  phrasesAddedThisWeek: number;
  topTags: string[];
  lastActivity?: string;
}

// Auth API Calls
export const authApi = {
  login: async (usernameOrEmail: string, password: string) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', { usernameOrEmail, password });
    return res.data;
  },

  register: async (data: { username: string; email: string; password: string; fullName?: string; bio?: string }) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/api/auth/me');
    return res.data;
  },

  getUsers: async (query?: string, page = 1, pageSize = 12) => {
    const res = await apiClient.get<ApiResponse<PagedResult<User>>>('/api/auth/users', {
      params: { query, page, pageSize },
    });
    return res.data;
  },

  getUserProfile: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/api/auth/users/${userId}`);
    return res.data;
  },
};

// Library API Calls
export const libraryApi = {
  // Words
  getWords: async (params: {
    userId?: string;
    search?: string;
    startingLetter?: string;
    fromDate?: string;
    toDate?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<PagedResult<Word>>>('/api/library/words', { params });
    return res.data;
  },

  getWordById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Word>>(`/api/library/words/${id}`);
    return res.data;
  },

  createWord: async (data: {
    term: string;
    definition: string;
    partOfSpeech?: string;
    exampleSentence?: string;
    tags?: string;
    notes?: string;
    isPublic?: boolean;
  }) => {
    const res = await apiClient.post<ApiResponse<Word>>('/api/library/words', data);
    return res.data;
  },

  updateWord: async (id: string, data: {
    term: string;
    definition: string;
    partOfSpeech?: string;
    exampleSentence?: string;
    tags?: string;
    notes?: string;
    isPublic?: boolean;
  }) => {
    const res = await apiClient.put<ApiResponse<Word>>(`/api/library/words/${id}`, data);
    return res.data;
  },

  deleteWord: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/api/library/words/${id}`);
    return res.data;
  },

  // Phrases
  getPhrases: async (params: {
    userId?: string;
    search?: string;
    startingLetter?: string;
    fromDate?: string;
    toDate?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const res = await apiClient.get<ApiResponse<PagedResult<Phrase>>>('/api/library/phrases', { params });
    return res.data;
  },

  getPhraseById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Phrase>>(`/api/library/phrases/${id}`);
    return res.data;
  },

  createPhrase: async (data: {
    phraseText: string;
    meaning: string;
    context?: string;
    tags?: string;
    notes?: string;
    isPublic?: boolean;
  }) => {
    const res = await apiClient.post<ApiResponse<Phrase>>('/api/library/phrases', data);
    return res.data;
  },

  updatePhrase: async (id: string, data: {
    phraseText: string;
    meaning: string;
    context?: string;
    tags?: string;
    notes?: string;
    isPublic?: boolean;
  }) => {
    const res = await apiClient.put<ApiResponse<Phrase>>(`/api/library/phrases/${id}`, data);
    return res.data;
  },

  deletePhrase: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/api/library/phrases/${id}`);
    return res.data;
  },

  // Statistics
  getMySummary: async () => {
    const res = await apiClient.get<ApiResponse<LibrarySummary>>('/api/library/summary');
    return res.data;
  },

  getUserSummary: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<LibrarySummary>>(`/api/library/summary/${userId}`);
    return res.data;
  },
};

// AI Practice & Memory Lab API Types
export interface TargetVocabularyItem {
  termOrPhrase: string;
  type: 'word' | 'phrase';
  definition: string;
  partOfSpeech?: string;
  exampleSentence?: string;
}

export interface ClozeQuestion {
  questionNumber: number;
  sentenceWithBlank: string;
  correctAnswer: string;
  options: string[];
  contextHint: string;
  explanation: string;
}

export interface DialogueTurn {
  speaker: string;
  speech: string;
  highlightedWords: string[];
}

export interface AiExercise {
  id: string;
  userId: string;
  title: string;
  exerciseType: 'story' | 'dialogue' | 'quiz';
  tone?: string;
  content: string;
  highlightedVocabulary: string[];
  targetItems: TargetVocabularyItem[];
  quizQuestions?: ClozeQuestion[];
  dialogueTurns?: DialogueTurn[];
  tipsForRetention: string;
  createdAt: string;
}

export interface GenerateExerciseParams {
  items: TargetVocabularyItem[];
  exerciseType: 'story' | 'dialogue' | 'quiz';
  tone?: 'literary' | 'conversational' | 'humorous' | 'philosophical';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SaveExerciseParams {
  title: string;
  exerciseType: 'story' | 'dialogue' | 'quiz';
  tone?: string;
  content: string;
  targetItems: TargetVocabularyItem[];
  quizQuestions?: ClozeQuestion[];
  tipsForRetention?: string;
}

// AI API Calls
export const aiApi = {
  generateExercise: async (params: GenerateExerciseParams) => {
    const res = await apiClient.post<ApiResponse<AiExercise>>('/api/ai/generate', params);
    return res.data;
  },

  saveExercise: async (params: SaveExerciseParams) => {
    const res = await apiClient.post<ApiResponse<string>>('/api/ai/saved', params);
    return res.data;
  },

  getHistory: async () => {
    const res = await apiClient.get<ApiResponse<AiExercise[]>>('/api/ai/history');
    return res.data;
  },

  getExerciseById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<AiExercise>>(`/api/ai/exercises/${id}`);
    return res.data;
  },

  deleteExercise: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/api/ai/exercises/${id}`);
    return res.data;
  },
};

