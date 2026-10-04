import React from 'react';
import { Check, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

const MatchPanel = ({ match }) => {
  if (!match) return null;
  const hasSemanticScore = match.semanticMatchPct !== null && match.semanticMatchPct !== undefined;

  return (
    <div className="card">
      <h3 className="font-bold text-navy mb-4">Match Analysis</h3>
      <div className="space-y-4 mb-5">
        <ProgressBar value={match.overallMatchPct} label="Overall Match" />
        <ProgressBar value={match.skillMatchPct} label="Skill Match" colorClass="bg-primary" />
        <ProgressBar value={match.experienceMatchPct} label="Experience Match" colorClass="bg-sky" />
        {hasSemanticScore ? (
          <ProgressBar value={match.semanticMatchPct} label="Semantic Match (AI)" colorClass="bg-gradient-to-r from-primary to-sky" />
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate bg-veryLightBlue rounded-lg px-3 py-2">
            <Sparkles size={13} className="text-primary flex-shrink-0" />
            Start the ML service for AI-powered semantic matching (see ml-service/README.md)
          </div>
        )}
      </div>

      {match.strongSkills?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate uppercase mb-1.5">Strong Skills</p>
          {match.strongSkills.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm text-navy py-0.5"><Check size={14} className="text-success" /> {s}</div>
          ))}
        </div>
      )}
      {match.partialSkills?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate uppercase mb-1.5">Partial Match</p>
          {match.partialSkills.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm text-navy py-0.5"><AlertTriangle size={14} className="text-warning" /> {s}</div>
          ))}
        </div>
      )}
      {match.missingSkills?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate uppercase mb-1.5">Missing</p>
          {match.missingSkills.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm text-navy py-0.5"><XCircle size={14} className="text-danger" /> {s}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchPanel;
