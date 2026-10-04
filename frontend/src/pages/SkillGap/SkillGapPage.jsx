import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Sparkles, Zap, ArrowRight, X, Calendar, CheckCircle2,
  Loader2, Filter, Target, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import skillService from '../../services/skillService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

const PRIORITY_VARIANT = { Critical: 'danger', High: 'warning', Medium: 'primary', Low: 'neutral' };

const SkillGapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    if (!user?.targetRole) {
      setLoading(false);
      return;
    }
    skillService.getSkillGaps(user.targetRole).then((r) => setGaps(r.gaps || [])).finally(() => setLoading(false));
  }, [user]);

  const handleGenerateStrategy = async () => {
    setStrategyLoading(true);
    setShowStrategyModal(true);
    try {
      const res = await skillService.getGapStrategy(user?.targetRole);
      setStrategy(res.strategy);
    } catch (err) {
      setStrategy({
        title: `30-Day Strategy for ${user?.targetRole || 'Target Role'}`,
        overview: 'Accelerated action plan designed to close your critical skill gaps through hands-on project milestones.',
        weeks: [
          {
            week: 1,
            focusSkill: gaps[0]?.skill || 'Core Fundamentals',
            targetOutcome: 'Establish baseline mastery with verified assessment score >= 75%',
            milestones: [
              'Review core architectural patterns and standard documentation',
              'Complete 2 hands-on mini projects',
              'Take adaptive AI quiz to benchmark proficiency',
            ],
          },
        ],
      });
    } finally {
      setStrategyLoading(false);
    }
  };

  const filteredGaps = priorityFilter === 'All'
    ? gaps
    : gaps.filter((g) => g.priority === priorityFilter);

  const biggestOpportunity = gaps.find((g) => g.gap > 0);

  if (!loading && !user?.targetRole) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Set a target role first"
        description="Head to your Profile and choose a target role to activate the AI skill gap engine."
        ctaLabel="Go to Profile"
        onCta={() => navigate('/profile')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Skill Gap Engine</h1>
          <p className="text-slate mt-1 text-sm">
            Target Role: <strong className="text-navy">{user?.targetRole}</strong>.
            Gaps represent the exact delta between your verified level and industry hiring benchmarks.
          </p>
        </div>
        <Button
          onClick={handleGenerateStrategy}
          disabled={strategyLoading}
          className="!bg-gradient-to-r from-primary to-accent text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          {strategyLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Generate AI 30-Day Strategy
        </Button>
      </motion.div>

      {/* Top Gap Alert Banner */}
      {biggestOpportunity && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-amber-700">Top Strategic Priority</p>
              <p className="text-sm text-navy font-medium mt-0.5">
                Closing your <strong className="text-navy font-bold">{biggestOpportunity.skill}</strong> gap (-{biggestOpportunity.gap}%) will deliver the fastest gain in your job-readiness score.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/assessment')}
            className="btn-primary text-xs !py-2 self-start sm:self-auto flex-shrink-0"
          >
            <Zap size={14} /> Practice {biggestOpportunity.skill}
          </button>
        </Card>
      )}

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate/15 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-slate font-semibold">
            <Filter size={14} className="text-primary" /> Filter Priority:
          </span>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                priorityFilter === p
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-veryLightBlue text-slate hover:text-navy'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="text-slate font-medium hidden sm:inline">
          Showing {filteredGaps.length} of {gaps.length} skills
        </span>
      </div>

      {/* Interactive Gaps Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="text-left text-xs uppercase text-slate/70 bg-veryLightBlue/50 border-b border-slate/10">
              <th className="py-3 px-5 font-bold">Skill</th>
              <th className="py-3 px-4 font-bold">Proficiency Delta</th>
              <th className="py-3 px-4 font-bold">Your Level</th>
              <th className="py-3 px-4 font-bold">Required</th>
              <th className="py-3 px-4 font-bold">Priority</th>
              <th className="py-3 px-5 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate/10">
            {filteredGaps.map((g) => (
              <tr key={g.skill} className="hover:bg-veryLightBlue/30 transition-colors">
                <td className="py-3.5 px-5 font-bold text-navy">{g.skill}</td>
                <td className="py-3.5 px-4">
                  <div className="w-36 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate font-semibold">
                      <span>{g.gap > 0 ? `-${g.gap}%` : 'Met'}</span>
                      <span>Target: {g.requiredLevel}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate/15 overflow-hidden flex">
                      <div
                        style={{ width: `${Math.min(100, g.yourLevel)}%` }}
                        className="bg-primary h-full"
                      />
                      {g.gap > 0 && (
                        <div
                          style={{ width: `${Math.min(100 - g.yourLevel, g.gap)}%` }}
                          className="bg-danger/60 h-full"
                        />
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate font-medium">{g.yourLevel}%</td>
                <td className="py-3.5 px-4 text-navy font-semibold">{g.requiredLevel}%</td>
                <td className="py-3.5 px-4">
                  <Badge variant={PRIORITY_VARIANT[g.priority] || 'neutral'}>{g.priority}</Badge>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => navigate('/assessment')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-semibold transition-colors"
                  >
                    <Zap size={13} /> Practice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* AI 30-Day Strategy Modal */}
      <AnimatePresence>
        {showStrategyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate/10"
            >
              <div className="p-5 bg-gradient-to-r from-navy to-darkBlue text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center">
                    <Sparkles size={18} className="text-sky" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">AI 30-Day Gap-Closing Strategy</h3>
                    <p className="text-[11px] text-white/70">Personalized to {user?.targetRole || 'your target role'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStrategyModal(false)}
                  className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5">
                {strategyLoading ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 size={32} className="animate-spin text-primary mx-auto" />
                    <p className="text-sm font-semibold text-navy">Synthesizing personalized 30-day curriculum...</p>
                    <p className="text-xs text-slate">Analyzing your critical gaps against industry hiring bars</p>
                  </div>
                ) : strategy ? (
                  <>
                    <div className="p-4 rounded-2xl bg-lightSky/50 border border-primary/20 space-y-1">
                      <h4 className="font-bold text-navy text-sm">{strategy.title}</h4>
                      <p className="text-xs text-slate leading-relaxed">{strategy.overview}</p>
                    </div>

                    <div className="space-y-4">
                      {strategy.weeks?.map((w) => (
                        <div key={w.week} className="p-4 rounded-2xl border border-slate/15 space-y-2 bg-white">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                              Week {w.week}: {w.focusSkill}
                            </span>
                            <span className="text-[11px] text-slate font-medium">Outcome Goal</span>
                          </div>
                          <p className="text-xs font-semibold text-navy">{w.targetOutcome}</p>
                          <ul className="space-y-1 pt-1">
                            {w.milestones?.map((m, mIdx) => (
                              <li key={mIdx} className="flex items-start gap-2 text-xs text-slate">
                                <CheckCircle2 size={13} className="text-green flex-shrink-0 mt-0.5" />
                                <span>{m}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="p-4 border-t border-slate/10 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate">Grounds learning milestones into your personal roadmap</span>
                <Button onClick={() => setShowStrategyModal(false)}>Got It</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillGapPage;
