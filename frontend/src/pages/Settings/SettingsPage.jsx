import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bot, Sparkles, Download, RefreshCw, Shield,
  CheckCircle2, Bell, User, Clock, Trash2, LogOut
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const COACH_TONES = [
  { id: 'rigorous', label: 'Rigorous & Technical', desc: 'Direct, in-depth evaluation mimicking staff engineer interviews.' },
  { id: 'encouraging', label: 'Encouraging & Supportive', desc: 'Positive, growth-mindset coaching with step-by-step motivation.' },
  { id: 'concise', label: 'Fast & Bullet-Pointed', desc: 'Ultra-concise summaries focused strictly on action items.' },
];

const STUDY_HOURS = [
  { id: '5', label: '5 hours / week', desc: 'Casual upskilling (45m / day)' },
  { id: '10', label: '10 hours / week', desc: 'Active job hunting (1.5h / day)' },
  { id: '20', label: '20+ hours / week', desc: 'Intensive career transition (3h / day)' },
];

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useApp();

  const [tone, setTone] = useState(localStorage.getItem('sf_ai_coach_tone') || 'rigorous');
  const [hours, setHours] = useState(localStorage.getItem('sf_ai_study_hours') || '10');
  const [briefingAlerts, setBriefingAlerts] = useState(
    localStorage.getItem('sf_ai_briefing_alerts') !== 'false'
  );
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(
    localStorage.getItem('sf_tts_enabled') !== 'false'
  );

  const handleSavePreferences = () => {
    localStorage.setItem('sf_ai_coach_tone', tone);
    localStorage.setItem('sf_ai_study_hours', hours);
    localStorage.setItem('sf_ai_briefing_alerts', String(briefingAlerts));
    localStorage.setItem('sf_tts_enabled', String(speechSynthesisEnabled));
    showToast('Preferences saved successfully');
  };

  const handleExportData = () => {
    try {
      const exportObject = {
        exportDate: new Date().toISOString(),
        user: {
          fullName: user?.fullName,
          email: user?.email,
          role: user?.role,
          targetRole: user?.targetRole,
          location: user?.location,
        },
        preferences: {
          coachingTone: tone,
          weeklyStudyHours: hours,
        },
        platform: 'SkillForge AI',
        version: '2.0.0',
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `skillforge-career-data-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Career data portfolio exported');
    } catch (err) {
      showToast('Could not export career data', 'error');
    }
  };

  const handleClearCachedBriefing = () => {
    sessionStorage.clear();
    showToast('Cached AI briefings and session state cleared');
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy flex items-center gap-2">
          <Settings className="text-primary" /> Settings & AI Preferences
        </h1>
        <p className="text-slate mt-1 text-sm">
          Customize your AI coaching persona, study velocity, audio tools, and export your career data.
        </p>
      </motion.div>

      {/* AI Coaching Persona */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="text-primary" size={18} />
          <h3 className="font-bold text-navy text-base">AI Career Coach Tone</h3>
        </div>
        <p className="text-xs text-slate mb-4">
          Defines the personality and feedback style used in Mock Interviews, Study Guides, and Daily Briefings.
        </p>

        <div className="space-y-2 mb-4">
          {COACH_TONES.map((item) => (
            <label
              key={item.id}
              onClick={() => setTone(item.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                tone === item.id
                  ? 'border-primary bg-lightSky/40 shadow-xs'
                  : 'border-slate/15 hover:border-slate/30'
              }`}
            >
              <input
                type="radio"
                name="coach_tone"
                checked={tone === item.id}
                onChange={() => setTone(item.id)}
                className="mt-0.5 text-primary focus:ring-primary"
              />
              <div>
                <p className="text-xs font-bold text-navy">{item.label}</p>
                <p className="text-xs text-slate mt-0.5">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Weekly Study Commitment */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="text-primary" size={18} />
          <h3 className="font-bold text-navy text-base">Weekly Study Velocity</h3>
        </div>
        <p className="text-xs text-slate mb-4">
          Your target weekly preparation target used by the Roadmap milestone velocity engine.
        </p>

        <div className="grid sm:grid-cols-3 gap-2 mb-4">
          {STUDY_HOURS.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHours(h.id)}
              className={`p-3 rounded-xl text-left border transition-all ${
                hours === h.id
                  ? 'border-primary bg-lightSky/40'
                  : 'border-slate/15 hover:border-slate/30'
              }`}
            >
              <p className="text-xs font-bold text-navy">{h.label}</p>
              <p className="text-[11px] text-slate mt-0.5">{h.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Notification & Audio Features */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="text-primary" size={18} />
          <h3 className="font-bold text-navy text-base">Intelligence & Audio Preferences</h3>
        </div>
        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-navy">Daily AI Career Briefing</p>
              <p className="text-[11px] text-slate">Show personalized 1-action daily focus banner on Dashboard</p>
            </div>
            <input
              type="checkbox"
              checked={briefingAlerts}
              onChange={(e) => setBriefingAlerts(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate/10">
            <div>
              <p className="text-xs font-semibold text-navy">Text-to-Speech Audio Read-Aloud</p>
              <p className="text-[11px] text-slate">Enable browser voice read-aloud buttons in Mock Interviews</p>
            </div>
            <input
              type="checkbox"
              checked={speechSynthesisEnabled}
              onChange={(e) => setSpeechSynthesisEnabled(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4 h-4"
            />
          </label>
        </div>

        <div className="mt-5 pt-3 border-t border-slate/10 flex justify-end">
          <Button onClick={handleSavePreferences} className="!text-xs !py-2">
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* Account Info & Data Export */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="text-primary" size={18} />
          <h3 className="font-bold text-navy text-base">Data & Privacy</h3>
        </div>
        <p className="text-xs text-slate mb-4">
          Signed in as <strong className="text-navy">{user?.email}</strong> via {user?.authProvider || 'Email'}.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleExportData}
            className="btn-secondary !text-xs !py-2 flex items-center gap-1.5"
          >
            <Download size={14} /> Export Career Portfolio (JSON)
          </button>
          <button
            onClick={handleClearCachedBriefing}
            className="btn-secondary !text-xs !py-2 flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> Refresh AI Session Cache
          </button>
        </div>
      </Card>

      {/* Logout Action */}
      <div className="flex justify-end">
        <button
          onClick={logout}
          className="text-xs font-semibold text-danger flex items-center gap-1.5 hover:underline p-2"
        >
          <LogOut size={14} /> Sign Out of SkillForge AI
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

