import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

export const Admin: React.FC = () => {
  const { articles, isAuthenticated, isAdmin, deleteArticle } = useAppContext();
  const navigate = useNavigate();

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

  return (
    <div className="container mx-auto px-4 md:px-12 py-6 md:py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 border-b border-neutral-200 pb-6 md:pb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-1 md:mb-2">Панель управления</h1>
          <p className="text-neutral-500 font-medium">
            {isAdmin ? 'Администратор' : 'Автор'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/studio/new')}
          className="w-full md:w-auto justify-center bg-neutral-900 text-[#F4F4F0] px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          <Plus size={18} /> Новая статья
        </button>
      </div>

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
                      onClick={() => navigate(`/admin/studio/${article.id}`)}
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
    </div>
  );
};
