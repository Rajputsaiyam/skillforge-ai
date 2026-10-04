import React from 'react';
import { Search, MapPin, Briefcase, Clock, SlidersHorizontal, X, Compass, Sparkles, GraduationCap } from 'lucide-react';

const WORK_MODES = [
  { value: '', label: 'All Work Modes' },
  { value: 'Remote', label: '🏠 Remote' },
  { value: 'Hybrid', label: '🏢 Hybrid' },
  { value: 'On-site', label: '📍 On-site' },
];

const WORK_TIMES = [
  { value: '', label: 'All Job Types' },
  { value: 'Internship', label: '🎓 Internship' },
  { value: 'Full-time', label: '💼 Full-time' },
  { value: 'Part-time', label: '⏱️ Part-time' },
  { value: 'Contract', label: '📝 Contract' },
];

const POPULAR_LOCATIONS = [
  'India',
  'Remote',
  'Bengaluru',
  'New Delhi',
  'Hyderabad',
  'Mumbai',
  'United States',
  'United Kingdom',
  'Germany',
  'Singapore',
];

const JobFilters = ({ filters, setFilters, onSearch, detectedLocation }) => {
  const detectedCountry = detectedLocation?.country || 'India';
  const detectedCity = detectedLocation?.city ? `${detectedLocation.city}, ${detectedCountry}` : detectedCountry;

  const handleQuickLocation = (loc) => {
    const updated = { ...filters, location: loc };
    setFilters(updated);
    if (onSearch) setTimeout(() => onSearch(updated), 50);
  };

  const handleQuickWorkTime = (time) => {
    const nextVal = filters.workTime === time ? '' : time;
    const updated = { ...filters, workTime: nextVal };
    setFilters(updated);
    if (onSearch) setTimeout(() => onSearch(updated), 50);
  };

  const handleQuickWorkMode = (mode) => {
    const nextVal = filters.workMode === mode ? '' : mode;
    const updated = { ...filters, workMode: nextVal };
    setFilters(updated);
    if (onSearch) setTimeout(() => onSearch(updated), 50);
  };

  const handleReset = () => {
    const resetFilters = { keyword: '', location: detectedCountry, workMode: '', workTime: '' };
    setFilters(resetFilters);
    if (onSearch) setTimeout(() => onSearch(resetFilters), 50);
  };

  const hasActiveFilters = Boolean(
    filters.keyword ||
    (filters.location && filters.location !== detectedCountry) ||
    filters.workMode ||
    filters.workTime
  );

  return (
    <div className="bg-white rounded-2xl border border-slate/15 p-4 sm:p-5 shadow-xs mb-6 space-y-3.5">
      {/* Primary Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Keyword Search */}
        <div className="md:col-span-4 flex items-center gap-2 bg-slate/5 border border-slate/15 rounded-xl px-3.5 py-2.5 focus-within:border-primary focus-within:bg-white transition-all">
          <Search size={16} className="text-slate shrink-0" />
          <input
            value={filters.keyword || ''}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch()}
            placeholder="Search role, skills (e.g. React, Python)"
            className="bg-transparent w-full text-xs sm:text-sm outline-none placeholder:text-slate/60 text-navy font-medium"
          />
          {filters.keyword && (
            <button
              onClick={() => setFilters({ ...filters, keyword: '' })}
              className="text-slate/50 hover:text-slate p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Location Filter with Geo-Context */}
        <div className="md:col-span-3 flex items-center gap-2 bg-slate/5 border border-slate/15 rounded-xl px-3.5 py-2.5 focus-within:border-primary focus-within:bg-white transition-all">
          <MapPin size={16} className="text-primary shrink-0" />
          <input
            value={filters.location || ''}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch()}
            placeholder={`Location (e.g. ${detectedCountry}, Remote)`}
            className="bg-transparent w-full text-xs sm:text-sm outline-none placeholder:text-slate/60 text-navy font-medium"
          />
          {filters.location && (
            <button
              onClick={() => setFilters({ ...filters, location: '' })}
              className="text-slate/50 hover:text-slate p-0.5"
              title="Clear location"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Work Time / Job Type (Internship vs Full-time) */}
        <div className="md:col-span-2 relative">
          <select
            value={filters.workTime || ''}
            onChange={(e) => {
              const updated = { ...filters, workTime: e.target.value };
              setFilters(updated);
              if (onSearch) setTimeout(() => onSearch(updated), 50);
            }}
            className="w-full bg-slate/5 border border-slate/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-navy font-medium outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer pr-8"
          >
            {WORK_TIMES.map((wt) => (
              <option key={wt.value} value={wt.value}>
                {wt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-3.5 pointer-events-none text-slate">
            <Clock size={14} />
          </div>
        </div>

        {/* Work Mode (Remote / Hybrid / On-site) */}
        <div className="md:col-span-2 relative">
          <select
            value={filters.workMode || ''}
            onChange={(e) => {
              const updated = { ...filters, workMode: e.target.value };
              setFilters(updated);
              if (onSearch) setTimeout(() => onSearch(updated), 50);
            }}
            className="w-full bg-slate/5 border border-slate/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-navy font-medium outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer pr-8"
          >
            {WORK_MODES.map((wm) => (
              <option key={wm.value} value={wm.value}>
                {wm.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-3.5 pointer-events-none text-slate">
            <Briefcase size={14} />
          </div>
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-1">
          <button
            onClick={() => onSearch && onSearch()}
            className="w-full h-full py-2.5 px-3 bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors"
            title="Search verified opportunities"
          >
            <SlidersHorizontal size={15} />
            <span className="md:hidden">Search</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Chips & Context Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate/10 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate uppercase tracking-wider mr-1 flex items-center gap-1">
            <Compass size={12} className="text-primary" /> Quick Filters:
          </span>

          {/* Quick Internship Toggle */}
          <button
            onClick={() => handleQuickWorkTime('Internship')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
              filters.workTime === 'Internship'
                ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
            }`}
          >
            <GraduationCap size={13} /> Internships
          </button>

          {/* Quick Full-time Toggle */}
          <button
            onClick={() => handleQuickWorkTime('Full-time')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
              filters.workTime === 'Full-time'
                ? 'bg-sky-100 text-sky-800 border-sky-300 shadow-2xs'
                : 'bg-slate/5 hover:bg-slate/10 text-slate border-slate/20'
            }`}
          >
            💼 Full-time
          </button>

          {/* Quick Remote Toggle */}
          <button
            onClick={() => handleQuickWorkMode('Remote')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
              filters.workMode === 'Remote'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-slate/5 hover:bg-slate/10 text-slate border-slate/20'
            }`}
          >
            🏠 Remote Only
          </button>

          {/* Auto-detected Country Button */}
          {detectedCountry && (
            <button
              onClick={() => handleQuickLocation(detectedCountry)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                filters.location === detectedCountry
                  ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-2xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
              }`}
              title={`Jobs & internships in ${detectedCountry}`}
            >
              <MapPin size={11} /> {detectedCountry} (Local)
            </button>
          )}

          {/* Global / Worldwide Button */}
          <button
            onClick={() => handleQuickLocation('Remote')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              filters.location === 'Remote'
                ? 'bg-primary text-white border-primary shadow-2xs'
                : 'bg-slate/5 hover:bg-slate/10 text-slate border-slate/20'
            }`}
          >
            🌐 Global Remote
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 ml-auto"
          >
            <X size={12} /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default JobFilters;
