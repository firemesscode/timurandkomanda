import React from 'react';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  const team = [
    { name: 'Тимур', role: 'Основатель & Главный редактор', image: 'https://picsum.photos/seed/timur/400/400' },
    { name: 'Анна', role: 'Арт-директор', image: 'https://picsum.photos/seed/anna/400/400' },
    { name: 'Михаил', role: 'Технический директор', image: 'https://picsum.photos/seed/mikhail/400/400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-16 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] mb-6">О нас</h1>
        <p className="text-xl text-[#86868B] max-w-3xl mx-auto leading-relaxed">
          Мы — независимое медиа, исследующее пересечение технологий, культуры и дизайна. Наша цель — рассказывать истории, которые вдохновляют и заставляют задуматься о будущем.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {team.map((member, index) => (
          <motion.div 
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="text-center group"
          >
            <div className="aspect-square overflow-hidden rounded-full bg-gray-100 mb-6 mx-auto max-w-[240px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <img 
                src={member.image} 
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <h3 className="text-xl font-bold text-[#1D1D1F] mb-1">{member.name}</h3>
            <p className="text-[#86868B] text-sm font-medium">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
