import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, X, Image as ImageIcon, Video as VideoIcon, Link } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MediaDropperProps {
  value: string;
  onChange: (url: string) => void;
  type: 'image' | 'video';
  label: string;
}

export const MediaDropper: React.FC<MediaDropperProps> = ({ value, onChange, type, label }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('photo')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('photo')
        .getPublicUrl(filePath);

      onChange(publicUrlData.publicUrl);
      setIsUrlMode(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ошибка при загрузке. Убедитесь, что бакет "photo" существует и доступен для записи.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">{label}</label>
      
      {value && !isUrlMode ? (
        <div className="relative rounded-md overflow-hidden bg-neutral-100 group border border-neutral-200">
          {type === 'image' ? (
            <img src={value} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
          ) : (
            <video src={value} controls className="w-full h-auto max-h-48" />
          )}
          <button
             type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            title="Удалить"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-[10px] truncate px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {value}
          </div>
        </div>
      ) : isUrlMode ? (
        <div className="flex flex-col gap-2">
          <input 
            type="url"
            placeholder={`https://... (${type === 'image' ? 'ссылка на фото' : 'ссылка на видео'})`}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-neutral-900"
            autoFocus
          />
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={() => setIsUrlMode(false)} className="text-neutral-500 hover:text-neutral-900 font-bold uppercase tracking-wider">
              {value ? 'Назад к файлу' : 'Загрузить файл'}
            </button>
            {value && (
               <button type="button" onClick={() => { onChange(''); setIsUrlMode(false); }} className="text-red-500 hover:text-red-700 font-bold uppercase tracking-wider ml-auto">
                 Очистить
               </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div 
            className={`relative w-full border-2 border-dashed rounded-md transition-colors ${dragActive ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50'} flex flex-col items-center justify-center p-6 text-center cursor-pointer min-h-[140px]`}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={type === 'image' ? "image/*" : "video/*,video/mp4,video/x-m4v,video/*"}
              onChange={handleChange}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-neutral-500">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm font-bold uppercase tracking-wider">Загрузка...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-500">
                {type === 'image' ? <ImageIcon size={24} className="opacity-50" /> : <VideoIcon size={24} className="opacity-50" />}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {type === 'image' ? 'Выбрать фото' : 'Выбрать видео'}
                </span>
                <span className="text-[10px] text-neutral-400">Или перетащите файл сюда</span>
              </div>
            )}
          </div>
          <button type="button" onClick={() => setIsUrlMode(true)} className="text-xs text-neutral-500 hover:text-neutral-900 font-bold uppercase tracking-wider text-left flex items-center gap-1 mt-1">
            <Link size={12} /> Вставить ссылку вместо загрузки
          </button>
        </div>
      )}
    </div>
  );
};
