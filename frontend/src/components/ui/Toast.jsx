import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICONS = { success: CheckCircle2, warning: AlertTriangle, error: XCircle };
const COLORS = { success: 'text-success', warning: 'text-warning', error: 'text-danger' };

const ToastContainer = () => {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || CheckCircle2;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="bg-white shadow-cardHover border border-slate/10 rounded-xl px-4 py-3 flex items-center gap-2 min-w-[220px]"
            >
              <Icon size={18} className={COLORS[t.type] || COLORS.success} />
              <span className="text-sm text-navy font-medium">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
