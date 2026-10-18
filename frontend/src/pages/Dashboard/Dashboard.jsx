import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Sparkles, Briefcase, ListChecks, Zap, MessageSquare,
  FileText, Route, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import CircularStat from '../../components/ui/CircularStat';
import ProgressBar from '../../components/ui/ProgressBar';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import skillService from '../../services/skillService';
import applicationService from '../../services/applicationService';
import jobService from '../../services/jobService';
import progressService from '../../services/progressService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [readiness, setReadiness] = useState({ overall: 0 });
  const [appsCount, setAppsCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [skillsRes, readinessRes, appsRes, jobsRes, briefingRes] = await Promise.all([
          skillService.getMySkills(),
          user?.targetRole ? skillService.getCareerReadiness(user.targetRole) : Promise.resolve({ overall: 0 }),
          applicationService.getMyApplications(),
          jobService.searchJobs({}).catch(() => ({ jobs: [] })),
          progressService.getDailyBriefing().catch(() => null),
        ]);
        setSkills(skillsRes.skills || []);
        setReadiness(readinessRes);
        setAppsCount(appsRes.applications?.length || 0);
        setJobsCount(jobsRes.jobs?.length || 0);
        if (briefingRes?.briefing) setBriefing(briefingRes.briefing);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 5);
  const skillStrength = skills.length ? Math.round(skills.reduce((s, sk) => s + sk.level, 0) / skills.length) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handleActionClick = (briefingData) => {
    if (!briefingData) return navigate('/assessment');
    if (briefingData.actionType === 'quiz') {
      navigate('/assessment');
    } else if (briefingData.actionType === 'interview') {
      navigate('/assessment');
    } else {
      navigate('/roadmap');
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              {greeting}, {user?.fullName?.split(' ')[0]} 👋
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <ShieldCheck size={12} className="text-emerald-500" /> Career AI Live
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Real-time career intelligence calibrated to your target role: <strong className="text-navy">{user?.targetRole || 'Full Stack Engineer'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/resume"
            className="btn-secondary text-xs !py-2.5 shadow-2xs hover:shadow-xs"
          >
            <FileText size={14} className="text-primary" /> Resume Studio
          </Link>
          <Link
            to="/assessment"
            className="btn-primary text-xs !py-2.5 shadow-md shadow-primary/25"
          >
            <Zap size={14} /> Practice Lab
          </Link>
        </div>
      </motion.div>

      {/* Daily AI Career Briefing Card */}
      {briefing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy via-darkBlue to-[#0f244a] p-6 sm:p-8 text-white shadow-2xl border border-white/15">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-primary/25 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-accent/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-sky backdrop-blur-md">
                  <Sparkles size={13} className="text-sky animate-pulse" />
                  <span>Daily AI Intelligence Briefing</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  {briefing.headline}
                </h2>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {briefing.advice}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3.5 flex-shrink-0">
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-right">
                  <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">Estimated Impact</span>
                  <span className="text-2xl font-black text-emerald-400">+{briefing.expectedReadinessGain}% Readiness</span>
                </div>
                <Button
                  onClick={() => handleActionClick(briefing)}
                  className="!bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold shadow-lg shadow-primary/30 text-xs !py-3 !px-5"
                >
                  {briefing.recommendedAction} <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Stat Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Career Readiness', value: readiness.overall || 0, icon: Target, isProgress: true, color: 'text-primary' },
          { label: 'Verified Skill Strength', value: skillStrength, icon: Sparkles, isProgress: true, color: 'text-accent' },
          { label: 'Active Job Matches', value: jobsCount, icon: Briefcase, isCount: true, badge: 'Live sync' },
          { label: 'Tracked Applications', value: appsCount, icon: ListChecks, isCount: true, badge: 'Active' },
        ].map((k, i) => (
          <Card
            key={k.label}
            delay={i * 0.05}
            className="hover:shadow-cardHover hover:border-primary/30 transition-all p-5 flex flex-col justify-between"
          >
            {k.isCount ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary shadow-2xs">
                  <k.icon size={22} />
                </div>
                <div className="text-3xl font-black text-navy tracking-tight">{k.value}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">{k.label}</div>
                {k.badge && (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate/15">
                    {k.badge}
                  </span>
                )}
              </div>
            ) : (
              <div className="py-1">
                <CircularStat value={k.value} label={k.label} />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Quick AI Action Launchpad */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-navy text-lg flex items-center gap-2">
              <Zap size={18} className="text-primary" /> AI Career Action Hub
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">High-impact actions to improve your hireability score today</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline-block">
            Target: <span className="text-primary font-bold">{user?.targetRole || 'Full Stack'}</span>
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/assessment"
            className="card hover:border-primary/50 hover:shadow-cardHover hover:-translate-y-1 transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3.5 group-hover:bg-primary group-hover:text-white transition-all shadow-2xs">
                <Zap size={20} />
              </div>
              <h4 className="font-bold text-navy text-sm mb-1.5 group-hover:text-primary transition-colors">Adaptive AI Quiz</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Calibrated dynamically to your target competencies and verified skill levels.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate/10 flex items-center justify-between text-xs font-bold text-primary">
              <span>Launch Quiz</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/assessment"
            className="card hover:border-cyan-500/50 hover:shadow-cardHover hover:-translate-y-1 transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3.5 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-2xs">
                <MessageSquare size={20} />
              </div>
              <h4 className="font-bold text-navy text-sm mb-1.5 group-hover:text-cyan-600 transition-colors">AI Voice Mock Interview</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Practice realistic technical & architectural questions with browser speech-to-text.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate/10 flex items-center justify-between text-xs font-bold text-cyan-600">
              <span>Start Interview</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/resume"
            className="card hover:border-emerald-500/50 hover:shadow-cardHover hover:-translate-y-1 transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-2xs">
                <FileText size={20} />
              </div>
              <h4 className="font-bold text-navy text-sm mb-1.5 group-hover:text-emerald-600 transition-colors">ATS Resume Studio</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Audit keyword coverage and rewrite bullets with the Google X-Y-Z formula.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate/10 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Audit Resume</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/roadmap"
            className="card hover:border-violet-500/50 hover:shadow-cardHover hover:-translate-y-1 transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3.5 group-hover:bg-violet-500 group-hover:text-white transition-all shadow-2xs">
                <Route size={20} />
              </div>
              <h4 className="font-bold text-navy text-sm mb-1.5 group-hover:text-violet-600 transition-colors">30-Day Learning Plan</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Weekly milestones with hands-on projects and AI micro-lessons.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate/10 flex items-center justify-between text-xs font-bold text-violet-600">
              <span>View Roadmap</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Top Skills vs Career Readiness */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-navy text-base">Top Verified Skills</h3>
              <p className="text-xs text-slate-500">Skills benchmarked from assessments and resume validation</p>
            </div>
            <Link to="/skill-graph" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Explore Skill Graph <ChevronRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
          ) : topSkills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 mb-3">No skills detected yet. Upload your resume to auto-extract your verified stack.</p>
              <Link to="/resume" className="btn-primary text-xs !py-2">Upload Resume</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {topSkills.map((s) => (
                <ProgressBar key={s._id} value={s.level} label={s.skillName} />
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-navy text-base">Role Match Score</h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {readiness.overall >= 70 ? 'Job Ready' : 'In Progress'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-navy">{readiness.overall || 0}%</span>
              <span className="text-xs font-semibold text-slate-500">target benchmark</span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Target Role: <strong className="text-navy">{user?.targetRole || 'Not specified'}</strong>
            </p>
            {readiness.breakdown && (
              <div className="space-y-3">
                {Object.entries(readiness.breakdown).map(([k, v]) => (
                  <ProgressBar key={k} value={v} label={k} height="h-2" />
                ))}
              </div>
            )}
          </div>
          <Link to="/skill-gaps" className="btn-secondary w-full mt-6 text-center text-xs !py-2.5">
            Analyze Competency Gaps <ArrowRight size={13} />
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
