import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

export const VpnWarning: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkVpn = async () => {
      // Проверяем, не закрывал ли пользователь плашку в этой сессии
      if (sessionStorage.getItem('vpn-warning-dismissed')) return;

      try {
        // Используем бесплатный API для проверки IP
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        
        // Если API вернул информацию о том, что это VPN, Proxy или Tor
        if (data.security && (data.security.vpn || data.security.proxy || data.security.tor)) {
          setShow(true);
        }
      } catch (e) {
        console.error('Failed to check VPN status', e);
      }
    };

    // Небольшая задержка перед проверкой, чтобы не блокировать основной рендер
    const timer = setTimeout(checkVpn, 2000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('vpn-warning-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-24 lg:top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          {/* Liquid Glass Effect */}
          <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex items-start gap-4">
            <div className="text-amber-500 mt-0.5 shrink-0 bg-amber-100/50 p-2 rounded-full">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 pt-0.5">
              <h4 className="text-sm font-bold text-neutral-900 tracking-tight">Включен VPN</h4>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed font-medium">
                Мы заметили, что вы используете VPN. Из-за этого сайт может загружаться медленнее или работать нестабильно.
              </p>
            </div>
            <button 
              onClick={dismiss} 
              className="text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/50 p-1.5 rounded-full transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
