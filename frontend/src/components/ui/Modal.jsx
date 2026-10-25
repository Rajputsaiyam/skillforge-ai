import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children, footer }) => (
  open ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-lg border border-slate/20 bg-white shadow-card"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate/10">
            <h3 className="font-bold text-lg text-navy">{title}</h3>
            <button onClick={onClose} className="text-slate hover:text-navy transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-6">{children}</div>
          {footer && <div className="px-6 py-4 border-t border-slate/10">{footer}</div>}
        </div>
      </div>
  ) : null
);

export default Modal;
