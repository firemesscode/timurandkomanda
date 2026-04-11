import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Edit2, Trash2, X, Check, Bold, Italic, Quote, Link as LinkIcon } from 'lucide-react';
import { useAppContext, Article } from '../store/AppContext';

export const Admin: React.FC = () => {
  const { articles, isAuthenticated, isAdmin, addArticle, updateArticle, deleteArticle } = useAppContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    import('../lib/supabase').then(({ isSupabaseConfigured }) => {
      if (!isSupabaseConfigured) {
        // Allow access in mock mode
        return;
      }
      if (!isAuthenticated) {
        navigate('/login');
      }
    });
  }, [isAuthenticated, navigate]);

  // In mock mode, we don't strictly enforce isAuthenticated for rendering
  // but we still want to show the UI.
  // if (!isAuthenticated) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentArticle.id) {
      await updateArticle(currentArticle.id, currentArticle);
    } else {
      await addArticle({
        ...currentArticle,
        published_at: currentArticle.status === 'published' ? new Date().toISOString() : undefined,
      });
    }
    setIsEditing(false);
    setCurrentArticle({});
  };

  const startEdit = (article?: Article) => {
    if (article) {
      setCurrentArticle(article);
    } else {
      setCurrentArticle({
        title: '',
        excerpt: '',
        content: '',
        image_url: `https://picsum.photos/seed/${Date.now()}/1200/600`,
        status: 'draft',
      });
    }
    setIsEditing(true);
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentArticle.content || '';
    
    let selectedText = text.substring(start, end);
    let newText = '';
    let cursorOffset = prefix.length;

    // Special handling for blockquotes on multiple lines
    if (prefix === '> ') {
      if (selectedText) {
        // Prefix every line in the selection with '> '
        selectedText = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        newText = text.substring(0, start) + selectedText + text.substring(end);
        cursorOffset = selectedText.length;
      } else {
        newText = text.substring(0, start) + prefix + text.substring(end);
      }
    } else {
      newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    }
    
    setCurrentArticle({ ...currentArticle, content: newText });
    
    // Focus and set cursor position after React re-renders
    setTimeout(() => {
      textarea.focus();
      if (prefix === '> ' && selectedText) {
        textarea.setSelectionRange(start, start + cursorOffset);
      } else {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const handleLinkInsert = () => {
    const url = prompt('Введите URL ссылки:');
    if (url) {
      insertMarkdown('[', `](${url})`);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-12 py-6 md:py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 border-b border-neutral-200 pb-6 md:pb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-1 md:mb-2">Панель управления</h1>
          <p className="text-neutral-500 font-medium">
            {isAdmin ? 'Администратор' : 'Автор'}
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => startEdit()}
            className="w-full md:w-auto justify-center bg-neutral-900 text-[#F4F4F0] px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors"
          >
            <Plus size={18} /> Новая статья
          </button>
        )}
      </div>

      {isEditing ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl border border-neutral-200 p-8 rounded-[2rem] bg-white shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">{currentArticle.id ? 'Редактирование' : 'Создание'} статьи</h2>
            <button onClick={() => setIsEditing(false)} className="text-neutral-400 hover:text-neutral-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Заголовок</label>
              <input 
                required
                type="text"
                value={currentArticle.title || ''}
                onChange={e => setCurrentArticle({...currentArticle, title: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-3 px-4 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors font-medium"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Краткое описание</label>
              <textarea 
                required
                rows={2}
                value={currentArticle.excerpt || ''}
                onChange={e => setCurrentArticle({...currentArticle, excerpt: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-3 px-4 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors resize-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">URL Изображения (Обложка)</label>
                <input 
                  required
                  type="url"
                  value={currentArticle.image_url || ''}
                  onChange={e => setCurrentArticle({...currentArticle, image_url: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-3 px-4 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">URL Видео (YouTube/MP4) - Опционально</label>
                <input 
                  type="url"
                  value={currentArticle.video_url || ''}
                  onChange={e => setCurrentArticle({...currentArticle, video_url: e.target.value})}
                  placeholder="Если указано, заменит фото в статье"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-3 px-4 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Автор фото / Источник</label>
                <input 
                  type="text"
                  value={currentArticle.image_credit || ''}
                  onChange={e => setCurrentArticle({...currentArticle, image_credit: e.target.value})}
                  placeholder="Например: Unsplash / Иван Иванов"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-3 px-4 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col pb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Статус</label>
                <select 
                  value={currentArticle.status || 'draft'}
                  onChange={e => setCurrentArticle({...currentArticle, status: e.target.value as any})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-2 px-3 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors font-medium"
                >
                  <option value="draft">Черновик</option>
                  <option value="review">На модерацию</option>
                  {isAdmin && <option value="published">Опубликовано</option>}
                  {isAdmin && <option value="rejected">Отклонено</option>}
                </select>
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={currentArticle.is_main || false}
                    onChange={e => setCurrentArticle({...currentArticle, is_main: e.target.checked})}
                    className="w-5 h-5 rounded-sm border-neutral-300 bg-white text-neutral-900 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm font-bold uppercase tracking-wider">Главная статья</span>
                </label>
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={currentArticle.is_urgent || false}
                    onChange={e => setCurrentArticle({...currentArticle, is_urgent: e.target.checked})}
                    className="w-5 h-5 rounded-sm border-neutral-300 bg-white text-neutral-900 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm font-bold uppercase tracking-wider text-red-600">Срочно</span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">Текст статьи (поддерживает Markdown)</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors" title="Жирный">
                    <Bold size={16} />
                  </button>
                  <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors" title="Курсив">
                    <Italic size={16} />
                  </button>
                  <button type="button" onClick={() => insertMarkdown('> ')} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors" title="Цитата">
                    <Quote size={16} />
                  </button>
                  <button type="button" onClick={handleLinkInsert} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors" title="Ссылка">
                    <LinkIcon size={16} />
                  </button>
                </div>
              </div>
              <textarea 
                ref={textareaRef}
                required
                rows={12}
                value={currentArticle.content || ''}
                onChange={e => setCurrentArticle({...currentArticle, content: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-3 px-4 text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors resize-y font-medium"
              />
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-neutral-200">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-neutral-300 rounded-sm hover:bg-neutral-100 transition-colors font-bold uppercase tracking-wider text-sm"
              >
                Отмена
              </button>
              <button 
                type="submit"
                className="px-6 py-3 bg-neutral-900 text-[#F4F4F0] font-bold uppercase tracking-wider text-sm rounded-sm hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                <Check size={18} /> Сохранить
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="border border-neutral-200 rounded-xl overflow-x-auto bg-white shadow-sm">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-neutral-500">Статья</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-neutral-500 hidden md:table-cell">Автор</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-neutral-500 hidden sm:table-cell">Дата</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-neutral-500">Статус</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-neutral-500 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-neutral-900 line-clamp-1">{article.title}</div>
                  </td>
                  <td className="py-4 px-6 text-neutral-600 text-sm font-medium hidden md:table-cell">
                    {article.author?.full_name || 'Неизвестно'}
                  </td>
                  <td className="py-4 px-6 text-neutral-600 text-sm font-medium hidden sm:table-cell">
                    {format(new Date(article.created_at), 'dd.MM.yyyy')}
                  </td>
                  <td className="py-4 px-6">
                    {article.status === 'published' && <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800">Опубликовано</span>}
                    {article.status === 'draft' && <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">Черновик</span>}
                    {article.status === 'review' && <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800">На модерации</span>}
                    {article.status === 'rejected' && <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800">Отклонено</span>}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => startEdit(article)}
                        className="text-neutral-400 hover:text-neutral-900 transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Удалить статью?')) {
                            deleteArticle(article.id);
                          }
                        }}
                        className="text-neutral-400 hover:text-red-600 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 font-medium">
                    Нет статей. Создайте первую!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
