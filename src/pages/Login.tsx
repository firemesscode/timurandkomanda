import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppContext } from '../store/AppContext';
import { Logo } from '../components/ui/Logo';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isSupabaseConfigured) {
      if (email === 'admin@example.com' && password === 'admin') {
        // Mock successful login by redirecting
        navigate('/admin');
      } else {
        setError('Неверный email или пароль (используйте admin@example.com / admin)');
      }
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Неверный email или пароль' : error.message);
    } else {
      navigate('/admin');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <Logo className="mb-8 text-neutral-900" />
          <h1 className="text-2xl font-serif tracking-tight mb-2 uppercase">Вход для авторов</h1>
          <p className="text-neutral-500 text-sm font-medium">Войдите в систему для управления контентом</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent border-b border-neutral-300 py-3 px-2 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-medium"
            />
          </div>
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full bg-transparent border-b border-neutral-300 py-3 px-2 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-medium"
            />
            {error && <p className="text-red-500 text-sm mt-2 px-2 font-medium">{error}</p>}
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-[#F4F4F0] font-bold uppercase tracking-wider py-4 rounded-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
