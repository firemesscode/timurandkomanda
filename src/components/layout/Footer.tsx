import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <Logo className="text-neutral-900" />
            </Link>
            <p className="text-neutral-600 max-w-sm font-medium">
              Современное медиа о технологиях, дизайне и будущем. Мы рассказываем истории, которые вдохновляют.
            </p>
          </div>
          
          <div>
            <h4 className="text-neutral-900 font-bold uppercase tracking-wider text-sm mb-6">Навигация</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/" className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">Главная</Link></li>
              <li><Link to="/articles" className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">Статьи</Link></li>
              <li><Link to="/about" className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">О нас</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-neutral-900 font-bold uppercase tracking-wider text-sm mb-6">Контакты</h4>
            <ul className="flex flex-col gap-4">
              <li><a href="mailto:hello@timurandteam.ru" className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">hello@timurandteam.ru</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">Telegram</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">Twitter</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500 font-medium">
          <p>© {new Date().getFullYear()} Тимур and команда. Все права защищены.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-neutral-900 transition-colors">Политика конфиденциальности</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
