import React from 'react';
import Card from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { Lock, Unlock, Mail, Shield, CheckCircle2 } from 'lucide-react';

const AdminSettings = () => {
  const { coldEmailLocked, toggleColdEmailLock, showToast } = useApp() || {};
  const isLocked = Boolean(coldEmailLocked ?? true);

  const handleToggle = () => {
    toggleColdEmailLock(!isLocked);
    showToast(
      !isLocked ? 'Cold Email tab is now locked.' : 'Cold Email tab is now unlocked.',
      !isLocked ? 'info' : 'success'
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Admin Settings</h1>
        <p className="text-sm text-slate mt-1">
          Manage platform feature access, module locks, and platform configurations.
        </p>
      </div>

      {/* Feature Module Access & Locks */}
      <Card>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate/15">
          <Shield size={18} className="text-primary" />
          <h3 className="font-bold text-navy">Feature Access & Module Locks</h3>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate/20 bg-slate-50/50">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isLocked ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
              }`}>
                {isLocked ? <Lock size={18} /> : <Mail size={18} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-navy">Cold Emailing Tab</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    isLocked
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {isLocked ? (
                      <>
                        <Lock size={9} /> Locked
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={9} /> Active
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Locks the Cold Email tab in the sidebar and blocks automated batch outreach from being dispatched.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggle}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isLocked
                  ? 'bg-navy text-white hover:bg-navy/90 shadow-2xs'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
              }`}
            >
              {isLocked ? (
                <>
                  <Unlock size={14} /> Unlock Tab
                </>
              ) : (
                <>
                  <Lock size={14} /> Lock Tab
                </>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Platform Configuration */}
      <Card>
        <h3 className="font-bold text-navy mb-2">Platform Configuration</h3>
        <p className="text-sm text-slate">
          Job provider, OAuth and ML-service configuration are managed via backend environment variables (see{' '}
          <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-navy font-mono">backend/.env.example</code>).
        </p>
      </Card>
    </div>
  );
};

export default AdminSettings;
