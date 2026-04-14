import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppContext } from '../store/AppContext';
import { ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { articles } = useAppContext();
  const navigate = useNavigate();
  
  const article = articles.find(a => a.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!article) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">Статья не найдена</h1>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider text-sm transition-colors">
          Вернуться на главную
        </button>
      </div>
    );
  }

  const renderMedia = () => {
    if (article.video_url) {
      // Check if it's a YouTube URL
      const youtubeMatch = article.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      if (youtubeMatch && youtubeMatch[1]) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
            title={article.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      }
      // Otherwise assume it's a direct video link (mp4, etc.)
      return (
        <video 
          src={article.video_url} 
          controls 
          className="w-full h-full object-cover"
        />
      );
    }
    
    // Fallback to image
    if (article.image_url) {
      return (
        <img 
          src={article.image_url} 
          alt={article.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100">
        <span className="text-neutral-300 font-bold uppercase tracking-widest text-sm">Нет медиа</span>
      </div>
    );
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-8 pb-16 md:pb-32">
      <Link to="/" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors mb-6 md:mb-8 font-bold uppercase tracking-wider text-sm">
        <ArrowLeft size={16} /> Назад
      </Link>
      
      <div className="mb-6 md:mb-8 border-b border-neutral-200 pb-4 md:pb-6">
        <div className="flex items-center gap-3 mb-4">
          {article.is_urgent && (
            <span className="text-red-600 font-bold text-xs uppercase tracking-wider">
              Молния
            </span>
          )}
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            {format(new Date(article.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
          </div>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-neutral-900 mb-4 md:mb-6 leading-tight"
        >
          {article.title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-lg md:text-xl text-neutral-600 leading-relaxed"
        >
          {article.excerpt}
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-center gap-3 mb-8 md:mb-10"
      >
        <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-neutral-900 font-bold">
          {article.author?.avatar_url ? (
            <img src={article.author.avatar_url} alt={article.author.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            (article.author?.full_name || 'К').charAt(0)
          )}
        </div>
        <div>
          <div className="font-bold text-neutral-900 text-sm">{article.author?.full_name || 'Редакция'}</div>
          <div className="text-xs text-neutral-500">{article.author?.bio || 'Автор'}</div>
        </div>
      </motion.div>

      {(article.image_url || article.video_url) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <div className="aspect-[16/9] bg-neutral-100 rounded-2xl overflow-hidden">
            {renderMedia()}
          </div>
          {article.image_credit && !article.video_url && (
            <div className="text-right mt-2 text-xs text-neutral-500 uppercase tracking-wider font-bold">
              Фото: {article.image_credit}
            </div>
          )}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="prose prose-lg prose-neutral max-w-none prose-p:text-neutral-900 prose-p:leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-neutral-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-neutral-900 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-600"
      >
        <div className="markdown-body">
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {article.content
              // Fix spaces inside bold tags: "** text **" -> "**text**"
              .replace(/\*\*([^*]+)\*\*/g, (_, text) => `**${text.trim()}**`)
              // Fix spaces inside italic tags: "* text *" -> "*text*"
              .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, (_, text) => `*${text.trim()}*`)
              // Fix missing space after blockquote: ">text" -> "> text"
              .replace(/^>([^\s>])/gm, '> $1')
            }
          </Markdown>
        </div>
      </motion.div>
    </article>
  );
};
