import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICONS = { success: CheckCircle2, warning: AlertTriangle, error: XCircle };
const COLORS = { success: 'text-success', warning: 'text-warning', error: 'text-danger' };

const ToastContainer = () => {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || CheckCircle2;
        return (
          <div key={t.id} className="flex min-w-[220px] items-center gap-2 rounded-lg border border-slate/20 bg-white px-4 py-3 shadow-card">
            <Icon size={18} className={COLORS[t.type] || COLORS.success} />
            <span className="text-sm font-medium text-navy">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
