import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAppContext } from '../../store/AppContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const location = useLocation();
  const { isAuthenticated, logout, articles } = useAppContext();

  const publishedArticles = articles
    .filter(a => a.status === 'published')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  useEffect(() => {
    if (publishedArticles.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % publishedArticles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [publishedArticles.length]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'Статьи', path: '/articles' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center group shrink-0">
              <Logo className="h-6 w-auto text-black group-hover:opacity-70 transition-opacity" />
            </Link>

            {publishedArticles.length > 0 && (
              <div className="hidden lg:block h-6 overflow-hidden relative w-96 border-l border-neutral-200 pl-6">
                <AnimatePresence>
                  <motion.div
                    key={tickerIndex}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-y-0 left-6 right-0 flex items-center"
                  >
                    <Link
                      to={`/article/${publishedArticles[tickerIndex]?.id}`}
                      className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-600 truncate transition-colors"
                    >
                      <span className="text-red-600 mr-2">Главное:</span>
                      {publishedArticles[tickerIndex]?.title}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-[13px] font-extrabold uppercase tracking-widest transition-colors hover:text-black",
                  location.pathname === link.path ? "text-black" : "text-neutral-500"
                )}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center gap-6 ml-4 pl-6 border-l-2 border-neutral-200 h-8">
                <Link to="/admin" className="text-[13px] font-extrabold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">
                  Админ
                </Link>
                <button onClick={logout} className="text-[13px] font-extrabold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">
                  Выйти
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-[13px] font-extrabold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors ml-4 pl-6 border-l-2 border-neutral-200 h-8 flex items-center">
                Вход
              </Link>
            )}
          </nav>

          <button 
            className="md:hidden text-black p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Ticker */}
        {publishedArticles.length > 0 && (
          <div className="lg:hidden h-8 bg-neutral-50 border-t border-neutral-200 overflow-hidden relative flex items-center px-4">
            <AnimatePresence>
              <motion.div
                key={tickerIndex}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-y-0 left-4 right-4 flex items-center"
              >
                <Link
                  to={`/article/${publishedArticles[tickerIndex]?.id}`}
                  className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 truncate w-full"
                >
                  <span className="text-red-600 mr-2">Главное:</span>
                  {publishedArticles[tickerIndex]?.title}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 border-b border-neutral-200 pb-4">
              <Logo className="h-6 w-auto text-black" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-black">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-6 text-xl font-extrabold uppercase tracking-widest">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="text-black hover:text-neutral-500 transition-colors">
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-neutral-200 my-2" />
              {isAuthenticated ? (
                <>
                  <Link to="/admin" className="text-black hover:text-neutral-500 transition-colors">Админ</Link>
                  <button onClick={logout} className="text-left text-black hover:text-neutral-500 transition-colors">Выйти</button>
                </>
              ) : (
                <Link to="/login" className="text-black hover:text-neutral-500 transition-colors">Вход</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
