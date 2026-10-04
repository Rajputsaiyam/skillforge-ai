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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">{greeting}, {user?.fullName?.split(' ')[0]}</h1>
          <p className="text-slate mt-1">Here is your real-time AI career intelligence briefing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/resume" className="btn-secondary text-xs !py-2">
            <FileText size={14} /> Resume Studio
          </Link>
          <Link to="/assessment" className="btn-primary text-xs !py-2">
            <Zap size={14} /> Practice Lab
          </Link>
        </div>
      </motion.div>

      {/* Daily AI Career Briefing Card */}
      {briefing && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy via-darkBlue to-[#172554] p-6 text-white shadow-xl border border-white/10">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-52 h-52 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/25 border border-primary/40 text-xs font-semibold text-sky">
                  <Sparkles size={13} className="text-sky animate-pulse" />
                  Daily AI Career Briefing
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {briefing.headline}
                </h2>
                <p className="text-sm text-white/80 leading-relaxed">
                  {briefing.advice}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 flex-shrink-0">
                <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm text-right">
                  <span className="text-[11px] text-white/70 block uppercase font-bold tracking-wider">Potential Gain</span>
                  <span className="text-2xl font-extrabold text-green">+{briefing.expectedReadinessGain}% Readiness</span>
                </div>
                <Button
                  onClick={() => handleActionClick(briefing)}
                  className="!bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold shadow-lg shadow-primary/30"
                >
                  {briefing.recommendedAction} <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Career Readiness', value: readiness.overall || 0, icon: Target },
          { label: 'Skill Strength', value: skillStrength, icon: Sparkles },
          { label: 'Job Matches', value: jobsCount, icon: Briefcase, isCount: true },
          { label: 'Applications', value: appsCount, icon: ListChecks, isCount: true },
        ].map((k, i) => (
          <Card key={k.label} delay={i * 0.05} className="text-center hover:shadow-cardHover transition-all">
            {k.isCount ? (
              <>
                <div className="w-11 h-11 rounded-xl bg-lightSky flex items-center justify-center mx-auto mb-2 text-primary">
                  <k.icon size={20} />
                </div>
                <div className="text-2xl font-extrabold text-navy">{k.value}</div>
                <div className="text-xs text-slate mt-1">{k.label}</div>
              </>
            ) : (
              <CircularStat value={k.value} label={k.label} />
            )}
          </Card>
        ))}
      </div>

      {/* Quick AI Action Launchpad */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-navy text-lg flex items-center gap-2">
            <Zap size={18} className="text-primary" /> AI Career Action Hub
          </h3>
          <span className="text-xs text-slate font-medium">Personalized for {user?.targetRole || 'Software Engineer'}</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/assessment"
            className="card hover:border-primary/40 hover:-translate-y-1 transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                <Zap size={20} />
              </div>
              <h4 className="font-bold text-navy text-sm mb-1">Adaptive AI Quiz</h4>
              <p className="text-xs text-slate leading-relaxed">
                Take an assessment calibrated to your verified skill levels.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
              Launch Quiz <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/assessment"
            className="card hover:border-accent/40 hover:-translate-y-1 transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3 group-hover:bg-accent group-hover:text-white transition-colors">
                <MessageSquare size={20} />
              </div>
              <h4 className="font-bold text-navy text-sm mb-1">AI Mock Interview</h4>
              <p className="text-xs text-slate leading-relaxed">
                Simulate role-specific technical interviews with speech-to-text.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent">
              Start Interview <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/resume"
            className="card hover:border-green/40 hover:-translate-y-1 transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-green/10 text-green flex items-center justify-center mb-3 group-hover:bg-green group-hover:text-white transition-colors">
                <FileText size={20} />
              </div>
              <h4 className="font-bold text-navy text-sm mb-1">ATS Resume Studio</h4>
              <p className="text-xs text-slate leading-relaxed">
                Score keyword coverage and power-rewrite bullets with Google X-Y-Z formula.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-green">
              Optimize Resume <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/roadmap"
            className="card hover:border-purple/40 hover:-translate-y-1 transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center mb-3 group-hover:bg-purple group-hover:text-white transition-colors">
                <Route size={20} />
              </div>
              <h4 className="font-bold text-navy text-sm mb-1">Active Roadmap</h4>
              <p className="text-xs text-slate leading-relaxed">
                Track weekly milestones and generate on-demand AI cheat sheets.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple">
              View Milestones <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Top Skills vs Career Readiness */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy text-base">Top Skills Overview</h3>
            <Link to="/skill-graph" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Explore Skill Graph <ChevronRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
          ) : topSkills.length === 0 ? (
            <p className="text-sm text-slate">No skills detected yet — upload your resume or take an assessment to get started.</p>
          ) : (
            <div className="space-y-4">
              {topSkills.map((s) => (
                <ProgressBar key={s._id} value={s.level} label={s.skillName} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-navy text-base">Career Readiness</h3>
            <span className="text-[11px] font-bold text-primary bg-lightSky px-2 py-0.5 rounded-full">
              {readiness.overall >= 70 ? 'Job Ready' : 'In Progress'}
            </span>
          </div>
          <div className="text-4xl font-extrabold text-primary mb-1">{readiness.overall || 0}%</div>
          <p className="text-xs text-slate mb-4">Target: <span className="font-semibold text-navy">{user?.targetRole || 'Not set'}</span></p>
          {readiness.breakdown && (
            <div className="space-y-2.5">
              {Object.entries(readiness.breakdown).map(([k, v]) => (
                <ProgressBar key={k} value={v} label={k} height="h-1.5" />
              ))}
            </div>
          )}
          <Link to="/skill-gaps" className="btn-secondary w-full mt-5 text-center text-xs">
            View Skill Gaps
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
