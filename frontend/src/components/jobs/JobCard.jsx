import React from 'react';
import { MapPin, Clock, Bookmark, ArrowUpRight, Check, AlertTriangle, XCircle, Linkedin, Radio, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Recently posted';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted 1 day ago';
  return `Posted ${days} days ago`;
};

const JobCard = ({ job, onSave, onApply, saved, applied, delay = 0 }) => {
  const match = job.match || {};
  const isLinkedIn = job.source === 'linkedin' || job.isLiveLinkedIn || Boolean(job.companyLogo);

  return (
    <Card hover delay={delay} className="flex flex-col gap-3.5 border-slate/15 relative overflow-hidden group">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {isLinkedIn ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Linkedin size={11} /> Live LinkedIn
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate/10 text-slate">
              Verified Opportunity
            </span>
          )}

          {(job.employmentType === 'Internship' || /intern/i.test(job.title)) ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
              🎓 Internship
            </span>
          ) : (
            <span className="text-xs text-slate">{job.employmentType || 'Full-time'}</span>
          )}

          <span className="text-xs text-slate">• {job.workMode || 'Remote'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate font-medium uppercase tracking-wider">AI Match</span>
          <span className={`text-base font-extrabold px-2 py-0.5 rounded-lg ${
            match.overallMatchPct >= 75
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : match.overallMatchPct >= 50
              ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'bg-slate/10 text-slate'
          }`}>
            {match.overallMatchPct ?? '--'}%
          </span>
        </div>
      </div>

      {/* Main Header with Logo */}
      <div className="flex items-start gap-3">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={job.company}
            className="w-11 h-11 rounded-xl object-contain border border-slate/15 bg-white p-1 shrink-0"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary flex items-center justify-center font-bold text-base shrink-0 border border-primary/20">
            {job.company?.charAt(0) || 'J'}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-navy text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-sm font-medium text-slate truncate mt-0.5">{job.company}</p>
        </div>
      </div>

      {/* Location & Metadata */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate">
        <span className="flex items-center gap-1"><MapPin size={12} className="text-slate/70" /> {job.location || 'Remote'}</span>
        <span>•</span>
        <span>{job.experienceRequired || '1-3 years'}</span>
        {job.employmentType && (
          <>
            <span>•</span>
            <span>{job.employmentType}</span>
          </>
        )}
      </div>

      {/* Skills Badges */}
      <div className="flex flex-wrap gap-1.5">
        {(match.strongSkills || job.requiredSkills || []).slice(0, 4).map((s) => (
          <span key={s} className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
            <Check size={10} /> {s}
          </span>
        ))}
        {(match.partialSkills || []).slice(0, 2).map((s) => (
          <span key={s} className="flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
            <AlertTriangle size={10} /> {s}
          </span>
        ))}
        {(match.missingSkills || []).slice(0, 2).map((s) => (
          <span key={s} className="flex items-center gap-1 text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-medium">
            <XCircle size={10} /> {s}
          </span>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate/10 mt-auto">
        <span className="text-xs text-slate flex items-center gap-1">
          <Clock size={12} /> {timeAgo(job.postedDate)}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave && onSave(job)}
            className={`p-2 rounded-xl border transition-colors ${
              saved
                ? 'bg-primary/10 border-primary text-primary'
                : 'border-slate/20 text-slate hover:text-primary hover:border-primary/40'
            }`}
            title={saved ? 'Saved in pipeline' : 'Save job'}
          >
            <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
          </button>

          {/* 1-Click Apply on LinkedIn & Track Button */}
          {job.linkedInApplyUrl && (
            <button
              onClick={() => onApply && onApply(job)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                applied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-[#0A66C2] hover:bg-[#084e96] border-[#0A66C2] text-white shadow-xs'
              }`}
              title="Apply on LinkedIn & auto-track live status"
            >
              <Linkedin size={13} />
              {applied ? (
                <>
                  <Check size={12} /> Applied
                </>
              ) : (
                <>
                  Apply & Track <ExternalLink size={11} />
                </>
              )}
            </button>
          )}

          <Link to={`/jobs/${job._id}`}>
            <Button className="!py-1.5 !px-3 text-xs !rounded-xl">
              Details <ArrowUpRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
