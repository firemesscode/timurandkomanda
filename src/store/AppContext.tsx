import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { mockArticles } from './MockData';

export type ArticleStatus = 'draft' | 'review' | 'published' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  is_admin: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  video_url?: string;
  image_credit?: string;
  author_id: string;
  status: ArticleStatus;
  is_urgent?: boolean;
  is_main?: boolean;
  published_at: string;
  created_at: string;
  author?: Profile;
}

interface AppContextType {
  articles: Article[];
  addArticle: (article: Partial<Article>) => Promise<void>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setArticles(mockArticles);
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    fetchArticles();

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchArticles = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    // Fetch articles with author profile
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data as Article[]);
    } else {
      console.error('Error fetching articles:', error);
    }
    setLoading(false);
  };

  const addArticle = async (article: Partial<Article>) => {
    if (!isSupabaseConfigured) {
      // ... mock logic omitted for brevity, keeping it as is ...
      const newArticle = {
        ...article,
        id: Date.now().toString(),
        author_id: 'mock-author-1',
        slug: article.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now(),
        created_at: new Date().toISOString(),
        published_at: article.status === 'published' ? new Date().toISOString() : undefined,
        author: {
          id: 'mock-author-1',
          email: 'timur@example.com',
          full_name: 'Тимур',
          avatar_url: 'https://picsum.photos/seed/timur/400/400',
          bio: 'Основатель и главный редактор',
          is_admin: true
        }
      } as Article;
      setArticles(prev => [newArticle, ...prev]);
      return;
    }

    if (!user) {
      alert("Ошибка: Вы не авторизованы");
      return;
    }
    
    // Remove joined properties that shouldn't be inserted into the database
    const { author, ...fieldsToInsert } = article;

    const newArticle = {
      ...fieldsToInsert,
      author_id: user.id,
      slug: article.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now(),
    };

    const { data, error } = await supabase
      .from('articles')
      .insert([newArticle])
      .select(`*, author:profiles(*)`)
      .single();

    if (!error && data) {
      setArticles(prev => [data as Article, ...prev]);
      alert("Статья успешно создана!");
    } else {
      console.error('Error adding article:', error);
      alert("Ошибка при создании статьи: " + error?.message);
    }
  };

  const updateArticle = async (id: string, updatedFields: Partial<Article>) => {
    if (!isSupabaseConfigured) {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } as Article : a));
      return;
    }

    // Remove joined properties that shouldn't be updated in the database
    const { author, ...fieldsToUpdate } = updatedFields;

    const { data, error } = await supabase
      .from('articles')
      .update(fieldsToUpdate)
      .eq('id', id)
      .select(`*, author:profiles(*)`)
      .single();

    if (!error && data) {
      setArticles(prev => prev.map(a => a.id === id ? (data as Article) : a));
      alert("Статья успешно обновлена!");
    } else {
      console.error('Error updating article:', error);
      alert("Ошибка при обновлении статьи: " + error?.message);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!isSupabaseConfigured) {
      setArticles(prev => prev.filter(a => a.id !== id));
      return;
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (!error) {
      setArticles(prev => prev.filter(a => a.id !== id));
    } else {
      console.error('Error deleting article:', error);
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{
      articles,
      addArticle,
      updateArticle,
      deleteArticle,
      user,
      profile,
      isAuthenticated: !!user,
      isAdmin: profile?.is_admin ?? false,
      logout,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
