import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Sparkles, Loader2,
  TrendingUp, FileText, ArrowRight, Tag, Zap, ChevronRight, RefreshCw
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import resumeService from '../../services/resumeService';
import { useApp } from '../../context/AppContext';

const TARGET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Machine Learning Engineer',
];

const AtsScoreChecker = ({ resume, defaultRole = 'Full Stack Developer', onScoreUpdated }) => {
  const [activeTab, setActiveTab] = useState('uploaded'); // 'uploaded' | 'custom'
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [customText, setCustomText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const { showToast } = useApp();

  const handleRunAudit = async () => {
    if (activeTab === 'custom' && !customText.trim()) {
      showToast('Please paste your resume text to audit', 'error');
      return;
    }
    if (activeTab === 'uploaded' && !resume) {
      showToast('Please upload a resume first or switch to "Test Custom Text"', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        targetRole,
        jobDescription,
        resumeText: activeTab === 'custom' ? customText : undefined,
      };
      const res = await resumeService.checkAtsScore(payload);
      setReport(res.atsReport);
      if (onScoreUpdated && res.atsReport?.overallScore != null) {
        onScoreUpdated(res.atsReport.overallScore);
      }
      showToast('ATS audit completed successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not complete ATS audit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500 bg-emerald-50';
    if (score >= 65) return 'text-amber-500 border-amber-500 bg-amber-50';
    return 'text-rose-500 border-rose-500 bg-rose-50';
  };

  const getBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <Card className="border-primary/20 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-navy text-lg flex items-center gap-2">
              Dedicated ATS Score Checker Model
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lightSky text-primary">
                v2.0 Model
              </span>
            </h2>
            <p className="text-xs text-slate">
              Simulates Workday, Greenhouse, and Taleo algorithms across 5 core screening dimensions.
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate/10 p-1 rounded-xl shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('uploaded')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'uploaded' ? 'bg-white text-navy shadow-xs' : 'text-slate hover:text-navy'
            }`}
          >
            Audit Uploaded Resume
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'custom' ? 'bg-white text-navy shadow-xs' : 'text-slate hover:text-navy'
            }`}
          >
            Test Raw Text
          </button>
        </div>
      </div>

      {/* Input controls */}
      <div className="space-y-3 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="sm:w-1/3">
            <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
              Target Career Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate/20 focus:outline-none focus:border-primary"
            >
              {TARGET_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
              Job Description (Optional — for semantic tailoring)
            </label>
            <input
              type="text"
              placeholder="Paste specific job requirements or role description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate/20 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {activeTab === 'custom' && (
          <div>
            <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
              Resume Text to Audit
            </label>
            <textarea
              rows={5}
              placeholder="Paste your resume sections, work experience bullets, or full draft text here..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate/20 focus:outline-none focus:border-primary"
            />
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button onClick={handleRunAudit} disabled={loading} className="!text-xs !py-2.5">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={15} /> Auditing with ATS Engine...
              </>
            ) : (
              <>
                <Sparkles size={15} /> Run Deep ATS Audit
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Audit Report View */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-5 border-t border-slate/15 space-y-6"
          >
            {/* Top Score Banner */}
            <div className="grid sm:grid-cols-3 gap-4 items-center bg-slate/5 p-5 rounded-2xl border border-slate/15">
              <div className="sm:col-span-1 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-slate/15 pb-4 sm:pb-0 sm:pr-4">
                <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center mb-2 ${getScoreColor(report.overallScore)}`}>
                  <span className="text-3xl font-black leading-none">{report.overallScore}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">/ 100</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-navy text-white text-xs font-black">
                    Grade {report.grade}
                  </span>
                  <span className="text-xs text-slate font-medium">{report.wordCount} words</span>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5 pl-0 sm:pl-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  ATS Screening Verdict
                </span>
                <h3 className="font-extrabold text-navy text-lg leading-tight">{report.status}</h3>
                <p className="text-xs text-slate leading-relaxed">
                  Evaluated using dense semantic matching and structural heuristics. Resumes scoring 80+ typically pass automated recruiter thresholds into human review.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-semibold text-slate/70">
                    Engine: {report.engine}
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Dimension Progress Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
                5-Dimensional ATS Competency Breakdown
              </h4>
              <div className="space-y-2.5">
                {Object.entries(report.dimensions || {}).map(([key, dim]) => (
                  <div key={key} className="p-3 rounded-xl bg-white border border-slate/15 shadow-2xs">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-navy flex items-center gap-1.5">
                        {dim.label}
                        <span className="text-[10px] font-normal text-slate">({dim.weight})</span>
                      </span>
                      <span className="font-extrabold text-navy">{dim.score}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getBarColor(dim.score)}`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Fixes vs Positive Signals */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              {/* Critical Fixes */}
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
                <h4 className="font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={15} /> Immediate ATS Blockers ({report.criticalFixes?.length || 0})
                </h4>
                {report.criticalFixes?.length > 0 ? (
                  <ul className="space-y-2 text-rose-900">
                    {report.criticalFixes.map((fix, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-500 font-bold shrink-0">•</span>
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-rose-700">No critical ATS format blockers found!</p>
                )}
              </div>

              {/* Positive Signals */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <h4 className="font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Verified Strengths ({report.positiveSignals?.length || 0})
                </h4>
                {report.positiveSignals?.length > 0 ? (
                  <ul className="space-y-2 text-emerald-900">
                    {report.positiveSignals.map((sig, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-700">Optimize formatting to unlock positive ATS flags.</p>
                )}
              </div>
            </div>

            {/* Quantified Metrics & Action Verbs Pill Tags */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs pt-1">
              {report.metricsDetected?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate/5 border border-slate/15">
                  <span className="font-bold text-navy block mb-2 uppercase tracking-wider text-[11px]">
                    Google X-Y-Z Metrics Detected
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.metricsDetected.map((m, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-slate/20 font-bold text-primary text-xs">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.missingKeywords?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate/5 border border-slate/15">
                  <span className="font-bold text-navy block mb-2 uppercase tracking-wider text-[11px]">
                    Recommended Keywords for {targetRole}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default AtsScoreChecker;
