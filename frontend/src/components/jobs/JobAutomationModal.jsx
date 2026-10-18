import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink,
  Copy, Check, Loader2, Sparkles, Sliders, MapPin, DollarSign,
  Briefcase, Mail, Filter, ArrowRight, Compass, Layers, Globe, Building2
} from 'lucide-react';
import Button from '../ui/Button';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import { useApp } from '../../context/AppContext';

export default function JobAutomationModal({ onClose, onAppliedUpdated }) {
  const { showToast, user } = useApp();

  const [config, setConfig] = useState({
    roles: 'MERN stack developer, full stack developer, React developer, Node.js developer, software engineer python',
    location: 'Delhi',
    subLocality: 'Connaught Place',
    distanceKm: '30',
    nearestOnly: true,
    salaryMin: '400000',
    maxJobs: '15',
    skills: 'react, node, mongodb, express, mern, javascript, python, flask, machine learning, full stack, fullstack, sql, tailwind',
    excludeTitleWords: 'senior, sr., lead, manager, architect, principal, trainer, php, laravel, .net, java developer',
    sources: ['linkedin', 'naukri', 'indeed', 'career_page'],
    emailTo: user?.email || 'saiyamrajput71@gmail.com',
    adzunaAppId: '',
    adzunaAppKey: '',
  });

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [running, setRunning] = useState(false);
  const [runStage, setRunStage] = useState('');
  const [results, setResults] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Load config on mount
  useEffect(() => {
    jobService.getAutomationConfig()
      .then((res) => {
        if (res?.config) {
          setConfig((prev) => ({
            ...prev,
            ...res.config,
            roles: Array.isArray(res.config.roles) ? res.config.roles.join(', ') : res.config.roles || prev.roles,
            skills: Array.isArray(res.config.skills) ? res.config.skills.join(', ') : res.config.skills || prev.skills,
            excludeTitleWords: Array.isArray(res.config.excludeTitleWords) ? res.config.excludeTitleWords.join(', ') : res.config.excludeTitleWords || prev.excludeTitleWords,
            sources: Array.isArray(res.config.sources) ? res.config.sources : prev.sources,
            subLocality: res.config.subLocality || prev.subLocality,
            nearestOnly: res.config.nearestOnly !== undefined ? res.config.nearestOnly : prev.nearestOnly,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingConfig(false));
  }, []);

  const toggleSource = (sourceKey) => {
    setConfig((prev) => {
      const exists = prev.sources.includes(sourceKey);
      let updated;
      if (exists) {
        if (prev.sources.length === 1) {
          showToast('Please keep at least one job source active', 'warning');
          return prev;
        }
        updated = prev.sources.filter((s) => s !== sourceKey);
      } else {
        updated = [...prev.sources, sourceKey];
      }
      return { ...prev, sources: updated };
    });
  };

  const handleSaveConfig = async () => {
    try {
      const payload = {
        ...config,
        roles: config.roles.split(',').map((r) => r.trim()).filter(Boolean),
        skills: config.skills.split(',').map((s) => s.trim()).filter(Boolean),
        excludeTitleWords: config.excludeTitleWords.split(',').map((w) => w.trim()).filter(Boolean),
        distanceKm: Number(config.distanceKm) || 30,
        salaryMin: Number(config.salaryMin) || 400000,
        maxJobs: Number(config.maxJobs) || 15,
        sources: config.sources,
        subLocality: config.subLocality,
        nearestOnly: config.nearestOnly,
      };
      await jobService.updateAutomationConfig(payload);
      showToast('Automation preferences saved', 'success');
    } catch (err) {
      showToast('Failed to save config', 'error');
    }
  };

  const handleRunAutomation = async () => {
    setRunning(true);
    setResults(null);

    const steps = [
      `Querying active job feeds across ${config.sources.length} platforms (LinkedIn, Naukri, Indeed, Career Pages)...`,
      `Calculating geographic distance from ${config.subLocality || config.location} using Haversine proximity...`,
      `Filtering out distant openings beyond ${config.distanceKm} km radius and below ₹4,00,000 salary...`,
      'Ranking nearest matches to your doorstep against your verified skill profile...',
      'Generating tailored 3-sentence application pitches with Neural Engine...',
      'Queuing matching jobs directly into your Application Tracker...',
    ];

    let stepIdx = 0;
    setRunStage(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setRunStage(steps[stepIdx]);
    }, 1700);

    try {
      const payload = {
        ...config,
        roles: config.roles.split(',').map((r) => r.trim()).filter(Boolean),
        skills: config.skills.split(',').map((s) => s.trim()).filter(Boolean),
        excludeTitleWords: config.excludeTitleWords.split(',').map((w) => w.trim()).filter(Boolean),
        distanceKm: Number(config.distanceKm) || 30,
        salaryMin: Number(config.salaryMin) || 400000,
        maxJobs: Number(config.maxJobs) || 15,
        sources: config.sources,
        subLocality: config.subLocality,
        nearestOnly: config.nearestOnly,
      };

      const res = await jobService.runAutomation(payload);
      clearInterval(interval);
      setResults(res.data);
      showToast(`Discovered & ranked ${res.data?.totalMatched || 0} nearest jobs!`, 'success');
      if (onAppliedUpdated) onAppliedUpdated();
    } catch (err) {
      clearInterval(interval);
      showToast('Automation encountered an issue', 'error');
    } finally {
      setRunning(false);
    }
  };

  const copyPitch = (pitchText, index) => {
    navigator.clipboard.writeText(pitchText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
    showToast('Application pitch copied to clipboard!', 'success');
  };

  const handle1ClickApply = async (job) => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }

    try {
      if (job.applicationId) {
        await applicationService.updateStatus(job.applicationId, 'Applied');
        setAppliedJobs((prev) => new Set([...prev, job.jobId]));
        showToast(`Marked ${job.title} at ${job.company} as Applied!`, 'success');
        if (onAppliedUpdated) onAppliedUpdated();
      }
    } catch (err) {
      console.warn('Status update notice:', err);
    }
  };

  // Helper for source badge styling
  const getSourceBadge = (source, sourceName) => {
    switch (source) {
      case 'linkedin':
        return {
          label: 'LinkedIn',
          bg: 'bg-[#0A66C2]/10',
          text: 'text-[#0A66C2]',
          border: 'border-[#0A66C2]/30',
        };
      case 'naukri':
        return {
          label: 'Naukri.com',
          bg: 'bg-[#0078DB]/10',
          text: 'text-[#0078DB]',
          border: 'border-[#0078DB]/30',
        };
      case 'indeed':
        return {
          label: 'Indeed',
          bg: 'bg-[#2164f3]/10',
          text: 'text-[#2164f3]',
          border: 'border-[#2164f3]/30',
        };
      case 'career_page':
        return {
          label: 'Direct Career Page',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-700',
          border: 'border-emerald-500/30',
        };
      default:
        return {
          label: sourceName || 'Aggregated',
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate/15 overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate/15 bg-gradient-to-r from-navy via-[#0d1f3c] to-navy text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/30">
              <Compass size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Multi-Source Job Automation & Proximity Engine
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  100% Free
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Aggregates from LinkedIn, Naukri, Indeed & Company Pages · Finds openings closest to your location.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Multi-Platform Sources Selector */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-lightSky/40 via-blue-50/60 to-transparent border border-primary/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                <Layers size={14} className="text-primary" /> Active Job Apps & Aggregation Sources:
              </span>
              <span className="text-[11px] font-semibold text-primary">
                {config.sources.length} Platforms Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => toggleSource('linkedin')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  config.sources.includes('linkedin')
                    ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-sm shadow-[#0A66C2]/30'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 opacity-60'
                }`}
              >
                <span>LinkedIn</span>
                {config.sources.includes('linkedin') && <Check size={13} />}
              </button>

              {/* Naukri.com */}
              <button
                type="button"
                onClick={() => toggleSource('naukri')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  config.sources.includes('naukri')
                    ? 'bg-[#0078DB] text-white border-[#0078DB] shadow-sm shadow-[#0078DB]/30'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 opacity-60'
                }`}
              >
                <span>Naukri.com</span>
                {config.sources.includes('naukri') && <Check size={13} />}
              </button>

              {/* Indeed India */}
              <button
                type="button"
                onClick={() => toggleSource('indeed')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  config.sources.includes('indeed')
                    ? 'bg-[#2164f3] text-white border-[#2164f3] shadow-sm shadow-[#2164f3]/30'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 opacity-60'
                }`}
              >
                <span>Indeed</span>
                {config.sources.includes('indeed') && <Check size={13} />}
              </button>

              {/* Company Career Pages */}
              <button
                type="button"
                onClick={() => toggleSource('career_page')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  config.sources.includes('career_page')
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 opacity-60'
                }`}
              >
                <Building2 size={13} />
                <span>Career Pages</span>
                {config.sources.includes('career_page') && <Check size={13} />}
              </button>
            </div>
          </div>

          {/* Automation Configuration Form */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate/15">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-primary" />
                <h4 className="font-extrabold text-navy text-sm">Hyper-Local Proximity & Search Rules</h4>
              </div>
              <button
                onClick={handleSaveConfig}
                className="text-xs font-bold text-primary hover:underline"
              >
                Save Preferences
              </button>
            </div>

            {/* Target Roles */}
            <div>
              <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1.5">
                <Briefcase size={13} className="text-primary" /> Target Roles (Batch Query)
              </label>
              <input
                value={config.roles}
                onChange={(e) => setConfig({ ...config, roles: e.target.value })}
                placeholder="MERN stack developer, full stack developer, React developer..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate/20 bg-white text-navy font-medium focus:outline-none focus:border-primary shadow-2xs"
              />
            </div>

            {/* Hyper-Local Proximity Settings */}
            <div className="p-3.5 rounded-xl bg-white border border-slate/20 space-y-3">
              <span className="text-[11px] font-extrabold text-navy uppercase tracking-wider flex items-center gap-1.5 text-primary">
                <MapPin size={13} /> Candidate Location & Proximity Distance Filter
              </span>

              <div className="grid sm:grid-cols-3 gap-3">
                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Base Metro / City</label>
                  <input
                    value={config.location}
                    onChange={(e) => setConfig({ ...config, location: e.target.value })}
                    placeholder="Delhi"
                    className="w-full text-xs p-2 rounded-lg border border-slate/20 text-navy font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Candidate Locality / Neighborhood */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nearest Locality / Landmark</label>
                  <input
                    value={config.subLocality}
                    onChange={(e) => setConfig({ ...config, subLocality: e.target.value })}
                    placeholder="Connaught Place / Okhla / South Delhi / Noida"
                    className="w-full text-xs p-2 rounded-lg border border-slate/20 text-navy font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Radius */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Max Distance Radius</label>
                  <div className="flex items-center gap-1">
                    {[15, 30, 60].map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => setConfig({ ...config, distanceKm: String(km) })}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                          Number(config.distanceKm) === km
                            ? 'bg-primary text-white border-primary shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strict Nearest-First Toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-slate/10">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.nearestOnly}
                    onChange={(e) => setConfig({ ...config, nearestOnly: e.target.checked })}
                    className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-bold text-navy">
                    📍 Prioritize Nearest Jobs First (Sort by Proximity Distance to My Location)
                  </span>
                </label>
                <span className="text-[11px] text-emerald-600 font-semibold hidden sm:inline">
                  Filters out distant listings
                </span>
              </div>
            </div>

            {/* Salary Floor & Exclusions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1.5">
                  <DollarSign size={13} className="text-emerald-600" /> Minimum Salary Floor (₹/year)
                </label>
                <input
                  type="number"
                  value={config.salaryMin}
                  onChange={(e) => setConfig({ ...config, salaryMin: e.target.value })}
                  placeholder="400000"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate/20 bg-white text-navy font-medium focus:outline-none focus:border-primary shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1 flex items-center gap-1.5">
                  <Filter size={13} className="text-rose-500" /> Exclude Seniority / Unwanted Title Words
                </label>
                <input
                  value={config.excludeTitleWords}
                  onChange={(e) => setConfig({ ...config, excludeTitleWords: e.target.value })}
                  placeholder="senior, sr., lead, manager, architect, principal, trainer, php, laravel, .net"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate/20 bg-white text-navy font-medium focus:outline-none focus:border-primary shadow-2xs"
                />
              </div>
            </div>

            {/* Launch Automation Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                ⚡ Finds real verified jobs nearest to you & writes custom 3-sentence application pitches automatically.
              </span>

              <Button
                onClick={handleRunAutomation}
                disabled={running}
                className="!py-3 !px-7 text-xs font-bold !bg-gradient-to-r from-amber-500 via-primary to-accent !text-white rounded-xl shadow-lg shadow-primary/25 shrink-0 flex items-center gap-2 cursor-pointer"
              >
                {running ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                {running ? 'Running Automation...' : 'Run Job Automation Now'}
              </Button>
            </div>
          </div>

          {/* Running Progress Bar */}
          {running && (
            <div className="p-6 rounded-2xl bg-lightSky/40 border border-primary/20 text-center space-y-3">
              <Loader2 className="animate-spin text-primary mx-auto" size={32} />
              <h4 className="font-extrabold text-navy text-sm">Executing Multi-Platform Proximity Pipeline</h4>
              <p className="text-xs text-primary font-bold animate-pulse">{runStage}</p>
            </div>
          )}

          {/* Results Stream */}
          {results && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate/15">
                <div>
                  <h4 className="font-extrabold text-navy text-base flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    Processed {results.totalMatched} Nearest Matching Jobs
                  </h4>
                  <p className="text-xs text-slate-500">
                    Targeted around <strong className="text-navy">{results.candidateLocation}</strong> (within {results.maxDistanceEnforced}) · Salary ₹4L+ floor enforced.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-4">
                {results.jobs?.map((job, idx) => {
                  const sourceBadge = getSourceBadge(job.source, job.sourceName);
                  return (
                    <div
                      key={job.jobId || idx}
                      className="p-5 rounded-2xl bg-white border border-slate/20 shadow-sm hover:border-primary/40 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Source Platform Badge */}
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${sourceBadge.bg} ${sourceBadge.text} ${sourceBadge.border}`}>
                              {sourceBadge.label}
                            </span>

                            {/* Proximity Distance Pill */}
                            {job.distanceText && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <MapPin size={10} className="text-emerald-600" /> {job.distanceText}
                              </span>
                            )}

                            {/* Match Score */}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {job.matchScore}% Match
                            </span>
                          </div>

                          <h5 className="font-black text-navy text-base leading-snug">{job.title}</h5>

                          <p className="text-xs text-slate-600 font-medium flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-navy">{job.company}</span>
                            <span>·</span>
                            <span>{job.subLocality || job.location}</span>
                            <span>·</span>
                            <span className="font-bold text-emerald-700">{job.salary}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handle1ClickApply(job)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                              appliedJobs.has(job.jobId)
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                          >
                            <ExternalLink size={13} />
                            {appliedJobs.has(job.jobId) ? 'Applied ✓' : `Apply on ${sourceBadge.label} →`}
                          </button>
                        </div>
                      </div>

                      {/* Matched Skills Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {job.matchedSkills?.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            ✓ {s}
                          </span>
                        ))}
                      </div>

                      {/* Tailored AI Application Pitch */}
                      {job.tailoredPitch && (
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate/20 text-xs text-navy space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider flex items-center gap-1">
                              <Sparkles size={11} /> AI Tailored Application Pitch (Ready to Send)
                            </span>
                            <button
                              onClick={() => copyPitch(job.tailoredPitch, idx)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-navy flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedIndex === idx ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                              <span>{copiedIndex === idx ? 'Copied' : 'Copy Pitch'}</span>
                            </button>
                          </div>
                          <p className="italic text-slate-700 leading-relaxed font-sans">
                            "{job.tailoredPitch}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate/10">
                        <span>Status: <strong className="text-navy">{appliedJobs.has(job.jobId) ? 'Applied' : 'Saved in Applications Hub'}</strong></span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> 1-Click Dispatch Ready
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
