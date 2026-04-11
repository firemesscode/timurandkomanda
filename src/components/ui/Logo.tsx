import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  const [isEasterTime, setIsEasterTime] = useState(false);
  const [showEasterLogo, setShowEasterLogo] = useState(false);

  useEffect(() => {
    // Проверяем, попадает ли текущая дата в период Пасхи (с 11 по 13 апреля)
    // Включил 11 апреля, чтобы вы могли увидеть это прямо сейчас
    const today = new Date();
    const month = today.getMonth(); // 0 = Январь, 3 = Апрель
    const date = today.getDate();
    
    if (month === 3 && date >= 11 && date <= 13) {
      setIsEasterTime(true);
    }
  }, []);

  useEffect(() => {
    if (!isEasterTime) return;

    // Периодически меняем логотип
    const interval = setInterval(() => {
      setShowEasterLogo(true);
      
      // Показываем пасхальное лого 5 секунд, затем возвращаем обычное
      setTimeout(() => {
        setShowEasterLogo(false);
      }, 5000);
      
    }, 15000); // Каждые 15 секунд

    return () => clearInterval(interval);
  }, [isEasterTime]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <AnimatePresence mode="wait">
        {!showEasterLogo ? (
          <motion.img 
            key="main-logo"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            src="https://i.postimg.cc/tg4vvxy6/timurkomandacernyj.png" 
            alt="Тимур and команда" 
            className="h-10 md:h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <motion.img 
            key="easter-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: [-8, 8, -8],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              rotate: {
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }
            }}
            src="https://i.postimg.cc/ThRSLR9H/Group-4.png" 
            alt="Пасхальное лого" 
            className="h-10 md:h-12 w-auto object-contain drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
