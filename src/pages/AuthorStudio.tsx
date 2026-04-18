import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Markdown } from 'tiptap-markdown';
import { Telegram } from '../lib/extensions/Telegram';
import { useAppContext, Article } from '../store/AppContext';
import { MediaDropper } from '../components/ui/MediaDropper';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Save, Image as ImageIcon, Youtube as YoutubeIcon, 
  Bold, Italic, Heading2, Heading3, List, ListOrdered, 
  Quote, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Settings,
  CheckCircle2, Loader2, X, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthorStudio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { articles, addArticle, updateArticle, isAuthenticated } = useAppContext();
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [article, setArticle] = useState<Partial<Article>>({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    image_url: '',
    video_url: '',
    image_credit: '',
    is_urgent: false,
    is_main: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (id && id !== 'new') {
      const existing = articles.find(a => a.id === id);
      if (existing) {
        setArticle(existing);
      }
    }
  }, [id, articles, isAuthenticated, navigate]);

  // Listen for Telegram iframe resize messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://t.me') return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'resize' && data.height) {
          const iframes = document.querySelectorAll('iframe[data-telegram-iframe]');
          iframes.forEach((iframe: any) => {
            if (iframe.contentWindow === event.source) {
              iframe.style.height = `${data.height}px`;
            }
          });
        }
      } catch (e) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Telegram,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto my-8',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-xl my-8',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Начните писать вашу историю...',
      }),
    ],
    content: article.content,
    onUpdate: ({ editor }) => {
      setArticle(prev => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-neutral max-w-none focus:outline-none min-h-[50vh]',
      },
    },
  });

  // Update editor content when article loads
  useEffect(() => {
    if (editor && article.content && editor.getHTML() !== article.content) {
      editor.commands.setContent(article.content);
    }
  }, [editor, article.id]); // Only run when ID changes (initial load)

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (id === 'new') {
        await addArticle({
          ...article,
          published_at: article.status === 'published' ? new Date().toISOString() : undefined,
        });
        navigate('/admin');
      } else if (id) {
        await updateArticle(id, {
          ...article,
          published_at: article.status === 'published' && !article.published_at ? new Date().toISOString() : article.published_at,
        });
        // Show success briefly
        setTimeout(() => setIsSaving(false), 500);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setIsSaving(false);
    }
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('photo')
          .upload(fileName, file);
          
        if (error) throw error;
        
        const { data: publicUrlData } = supabase.storage
          .from('photo')
          .getPublicUrl(fileName);
          
        if (editor) {
          editor.chain().focus().setImage({ src: publicUrlData.publicUrl }).run();
        }
      } catch (err) {
        console.error(err);
        alert('Ошибка при загрузке изображения в статью.');
      }
    };
    input.click();
  };

  const addYoutube = () => {
    const url = window.prompt('Введите URL YouTube видео:');
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const addTelegram = () => {
    const url = window.prompt('Введите URL поста Telegram (например, https://t.me/durov/43):');
    if (url && editor) {
      editor.chain().focus().setTelegramEmbed({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Введите URL ссылки:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-4 w-px bg-neutral-300"></div>
          <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
            {id === 'new' ? 'Новая статья' : 'Редактирование'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'}`}
            title="Настройки статьи"
          >
            <Settings size={20} />
          </button>
          
          <select 
            value={article.status}
            onChange={(e) => setArticle({...article, status: e.target.value as any})}
            className="bg-neutral-50 border border-neutral-200 text-sm font-bold rounded-md px-3 py-1.5 focus:outline-none focus:border-neutral-900"
          >
            <option value="draft">Черновик</option>
            <option value="review">На проверку</option>
            <option value="published">Опубликовано</option>
          </select>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md font-bold text-sm transition-colors disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-3xl mx-auto px-8 pt-12">
            {/* Title Input */}
            <textarea
              value={article.title}
              onChange={(e) => {
                setArticle({...article, title: e.target.value});
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Заголовок статьи"
              className="w-full text-4xl md:text-5xl font-extrabold tracking-tighter text-neutral-900 placeholder:text-neutral-300 focus:outline-none resize-none overflow-hidden mb-8 leading-tight"
              rows={1}
            />

            {/* Toolbar */}
            <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-md border border-neutral-200 rounded-xl p-1.5 flex flex-wrap items-center gap-1 mb-8 shadow-sm">
              <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={18} />} tooltip="Жирный" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={18} />} tooltip="Курсив" />
              <div className="w-px h-5 bg-neutral-200 mx-1"></div>
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={<Heading2 size={18} />} tooltip="Заголовок 2" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={<Heading3 size={18} />} tooltip="Заголовок 3" />
              <div className="w-px h-5 bg-neutral-200 mx-1"></div>
              <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={<List size={18} />} tooltip="Маркированный список" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={<ListOrdered size={18} />} tooltip="Нумерованный список" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={<Quote size={18} />} tooltip="Цитата" />
              <div className="w-px h-5 bg-neutral-200 mx-1"></div>
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={18} />} tooltip="По левому краю" />
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={18} />} tooltip="По центру" />
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={18} />} tooltip="По правому краю" />
              <div className="w-px h-5 bg-neutral-200 mx-1"></div>
              <ToolbarButton onClick={setLink} active={editor.isActive('link')} icon={<LinkIcon size={18} />} tooltip="Ссылка" />
              <ToolbarButton onClick={addImage} icon={<ImageIcon size={18} />} tooltip="Изображение" />
              <ToolbarButton onClick={addYoutube} icon={<YoutubeIcon size={18} />} tooltip="YouTube Видео" />
              <ToolbarButton onClick={addTelegram} icon={<Send size={18} />} tooltip="Telegram пост" />
            </div>

            {/* TipTap Content */}
            {editor && (
              <BubbleMenu 
                editor={editor} 
                tippyOptions={{ duration: 100 }}
                className="bg-neutral-900 text-white shadow-xl rounded-xl overflow-hidden flex items-center p-1 border border-neutral-800"
              >
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}
                  title="Жирный"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}
                  title="Курсив"
                >
                  <Italic size={16} />
                </button>
                <div className="w-px h-5 bg-neutral-700 mx-1"></div>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}
                  title="Заголовок 2"
                >
                  <Heading2 size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}
                  title="Заголовок 3"
                >
                  <Heading3 size={16} />
                </button>
                <div className="w-px h-5 bg-neutral-700 mx-1"></div>
                <button
                  onClick={setLink}
                  className={`p-2 rounded transition-colors ${editor.isActive('link') ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}
                  title="Ссылка"
                >
                  <LinkIcon size={16} />
                </button>
                <button
                  onClick={addTelegram}
                  className="p-2 rounded transition-colors text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  title="Telegram пост"
                >
                  <Send size={16} />
                </button>
              </BubbleMenu>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Settings Sidebar */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-neutral-200 bg-neutral-50 overflow-y-auto shrink-0"
            >
              <div className="p-6 w-[320px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-neutral-900 uppercase tracking-widest text-sm">Настройки</h3>
                  <button onClick={() => setShowSettings(false)} className="text-neutral-400 hover:text-neutral-900">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Краткое описание (Анонс)</label>
                    <textarea 
                      value={article.excerpt || ''}
                      onChange={e => setArticle({...article, excerpt: e.target.value})}
                      rows={3}
                      className="w-full bg-white border border-neutral-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-neutral-900 resize-none"
                    />
                  </div>

                  <MediaDropper 
                    type="image"
                    label="Обложка (фото)"
                    value={article.image_url || ''}
                    onChange={(url) => setArticle({...article, image_url: url})}
                  />

                  <MediaDropper 
                    type="video"
                    label="Видео обложка"
                    value={article.video_url || ''}
                    onChange={(url) => setArticle({...article, video_url: url})}
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Автор фото / Источник</label>
                    <input 
                      type="text"
                      value={article.image_credit || ''}
                      onChange={e => setArticle({...article, image_credit: e.target.value})}
                      className="w-full bg-white border border-neutral-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="pt-4 border-t border-neutral-200 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${article.is_urgent ? 'bg-red-600 border-red-600 text-white' : 'border-neutral-300 text-transparent group-hover:border-red-600'}`}>
                        <CheckCircle2 size={14} />
                      </div>
                      <input 
                        type="checkbox" 
                        checked={article.is_urgent || false}
                        onChange={e => setArticle({...article, is_urgent: e.target.checked})}
                        className="hidden"
                      />
                      <span className="text-sm font-bold text-neutral-900">Срочная новость (Молния)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${article.is_main ? 'bg-blue-600 border-blue-600 text-white' : 'border-neutral-300 text-transparent group-hover:border-blue-600'}`}>
                        <CheckCircle2 size={14} />
                      </div>
                      <input 
                        type="checkbox" 
                        checked={article.is_main || false}
                        onChange={e => setArticle({...article, is_main: e.target.checked})}
                        className="hidden"
                      />
                      <span className="text-sm font-bold text-neutral-900">Главная статья</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, active, icon, tooltip }: { onClick: () => void, active?: boolean, icon: React.ReactNode, tooltip: string }) => (
  <button
    onClick={onClick}
    title={tooltip}
    className={`p-2 rounded transition-colors ${active ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
  >
    {icon}
  </button>
);
