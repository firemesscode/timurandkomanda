import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppContext, Article } from '../store/AppContext';
import { ArrowRight } from 'lucide-react';

const MediaPreview = ({ imageUrl, videoUrl, title }: { imageUrl: string, videoUrl?: string, title: string }) => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;
    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;

    const cycle = () => {
      setShowVideo(true);
      timeout1 = setTimeout(() => {
        setShowVideo(false);
        timeout2 = setTimeout(cycle, 6000); // Показываем картинку 6 секунд
      }, 6000); // Показываем видео 6 секунд
    };

    // Случайная задержка перед первым запуском, чтобы видео не начинались одновременно
    const initialDelay = setTimeout(cycle, 1000 + Math.random() * 4000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [videoUrl]);

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const ytId = videoUrl ? getYoutubeId(videoUrl) : null;

  return (
    <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700 ease-out">
      {videoUrl && (
        <div className="absolute inset-0 z-0 bg-black">
          {ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&modestbranding=1&showinfo=0`}
              className="w-full h-full object-cover pointer-events-none scale-[1.35]"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              tabIndex={-1}
            />
          ) : (
            <video 
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}
      <img 
        src={imageUrl} 
        alt={title}
        className={`w-full h-full object-cover relative z-10 transition-opacity duration-1000 ${showVideo ? "opacity-0" : "opacity-100"}`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export const Home: React.FC = () => {
  const { articles } = useAppContext();
  const publishedArticles = articles.filter(a => a.status === 'published').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  if (publishedArticles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Пока нет опубликованных статей</h2>
        <p className="text-neutral-600 mb-8">Зайдите в панель администратора, чтобы добавить новые статьи.</p>
        <Link to="/admin" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          Перейти в админку
        </Link>
      </div>
    );
  }

  // Find the first article marked as main, otherwise fallback to the newest one
  const featuredIndex = publishedArticles.findIndex(a => a.is_main);
  const featured = featuredIndex !== -1 ? publishedArticles[featuredIndex] : publishedArticles[0];
  
  // The rest are all articles except the featured one
  const rest = publishedArticles.filter(a => a.id !== featured.id);

  const Feed = ({ className }: { className?: string }) => (
    <div className={className}>
      <div className="flex items-center justify-between mb-6 border-t border-neutral-200 pt-4">
        <h3 className="text-lg font-extrabold uppercase tracking-widest flex items-center gap-2 text-neutral-900">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
          Лента
        </h3>
        <Link to="/articles" className="text-xs font-bold text-neutral-500 hover:text-blue-600 uppercase tracking-wider transition-colors flex items-center gap-1">
          Все <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="flex flex-col">
        {publishedArticles.slice(0, 6).map((article) => (
          <Link 
            key={`feed-${article.id}`} 
            to={`/article/${article.id}`} 
            className="group flex gap-4 py-4 border-b border-neutral-200 last:border-0 hover:bg-neutral-50 transition-colors"
          >
            <div className="text-sm font-bold text-neutral-400 shrink-0 pt-0.5 w-12">
              {format(new Date(article.created_at), 'HH:mm')}
            </div>
            <div>
              {article.is_urgent && (
                <span className="text-red-600 font-bold text-[10px] uppercase tracking-widest mr-2">
                  Молния
                </span>
              )}
              <h4 className="text-[15px] font-bold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug">
                {article.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 pt-4 md:pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Main Content Area (Left) */}
        <div className="lg:col-span-8">
          {/* Featured Article */}
          <section className="mb-8 md:mb-12">
            <Link to={`/article/${featured.id}`} className="block group">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="aspect-[16/9] md:aspect-[2/1] overflow-hidden bg-neutral-100 mb-6 rounded-2xl relative">
                  <MediaPreview imageUrl={featured.image_url} videoUrl={featured.video_url} title={featured.title} />
                </div>
                <div className="max-w-4xl">
                  <div className="flex items-center gap-3 mb-4">
                    {featured.is_urgent && (
                      <span className="text-red-600 font-bold text-xs uppercase tracking-widest">
                        Молния
                      </span>
                    )}
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      {format(new Date(featured.created_at), 'd MMMM, HH:mm', { locale: ru })}
                    </div>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-neutral-900 mb-3 md:mb-4 group-hover:text-blue-600 transition-colors leading-[1.1]">
                    {featured.title}
                  </h2>
                  <p className="text-lg md:text-xl text-neutral-600 line-clamp-3 leading-relaxed">
                    {featured.excerpt}
                  </p>
                </div>
              </motion.div>
            </Link>
          </section>

          {/* Mobile Feed (Hidden on Desktop) */}
          <Feed className="block lg:hidden mb-12" />

          {/* Grid Articles */}
          {rest.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6 md:mb-8 border-t border-neutral-200 pt-4">
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-900 uppercase">Свежее</h2>
                <Link to="/articles" className="text-sm font-bold text-neutral-500 hover:text-blue-600 uppercase tracking-wider transition-colors flex items-center gap-1">
                  Все статьи <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-12">
                {rest.map((article, index) => {
                  // Break monotony: Make every 3rd article (but not the first) span full width on mobile/tablet
                  const isHorizontal = index % 3 === 0 && index !== 0;
                  
                  return (
                    <motion.div 
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
                      className={isHorizontal ? "sm:col-span-2" : ""}
                    >
                      <Link to={`/article/${article.id}`} className={`group flex h-full ${isHorizontal ? 'flex-col sm:flex-row gap-6' : 'flex-col'}`}>
                        <div className={`relative overflow-hidden bg-neutral-100 rounded-2xl shrink-0 ${isHorizontal ? 'sm:w-1/2 aspect-[16/9]' : 'aspect-[16/9] mb-4'}`}>
                          {article.is_urgent && (
                            <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                              Срочно
                            </div>
                          )}
                          <MediaPreview imageUrl={article.image_url} videoUrl={article.video_url} title={article.title} />
                        </div>
                        <div className={`flex-grow flex flex-col ${isHorizontal ? 'justify-center' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                              {format(new Date(article.created_at), 'd MMM, HH:mm', { locale: ru })}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-neutral-600 text-sm line-clamp-3 mt-auto leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (Right) - News Feed (Hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24">
            <Feed />
          </div>
        </div>

      </div>
    </div>
  );
};
