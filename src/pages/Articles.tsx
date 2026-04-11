import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppContext } from '../store/AppContext';

export const Articles: React.FC = () => {
  const { articles } = useAppContext();
  const publishedArticles = articles.filter(a => a.status === 'published').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-16 md:pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 md:mb-12 border-b border-neutral-200 pb-4 md:pb-6"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-neutral-900 mb-2 uppercase">Все материалы</h1>
        <p className="text-lg text-neutral-500 font-medium">Наши статьи, новости и аналитика в хронологическом порядке.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {publishedArticles.map((article, index) => (
          <motion.div 
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link to={`/article/${article.id}`} className="block h-full group">
              <div className="flex flex-col h-full">
                <div className="aspect-[16/9] overflow-hidden bg-neutral-100 mb-4 relative rounded-xl">
                  {article.is_urgent && (
                    <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                      Срочно
                    </div>
                  )}
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                      {format(new Date(article.created_at), 'd MMMM yyyy', { locale: ru })}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-neutral-600 text-sm line-clamp-3 mt-auto leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
