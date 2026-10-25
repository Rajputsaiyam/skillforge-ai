import React, { useEffect, useState } from 'react';
import {
  Target, BarChart3, Briefcase, ListChecks, Zap, MessageSquare,
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              {greeting}, {user?.fullName?.split(' ')[0]}
            </h1>
            <span className="text-xs font-semibold text-success">
              <ShieldCheck size={13} className="mr-1 inline" /> Profile synced
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
      </div>

      {/* Daily AI Career Briefing Card */}
      {briefing && (
        <div className="border border-slate/20 border-l-4 border-l-primary bg-white p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Daily career briefing</p>
                <h2 className="text-xl font-bold leading-snug tracking-tight text-navy sm:text-2xl">
                  {briefing.headline}
                </h2>
                <p className="text-sm leading-relaxed text-slate">
                  {briefing.advice}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-3.5 md:items-end">
                <div className="border border-slate/20 bg-veryLightBlue px-4 py-2.5 text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate">Estimated impact</span>
                  <span className="text-2xl font-bold text-primary">+{briefing.expectedReadinessGain}% readiness</span>
                </div>
                <Button
                  onClick={() => handleActionClick(briefing)}
                  className="!px-5 !py-3 text-xs"
                >
                  {briefing.recommendedAction} <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          </div>
      )}

      {/* Top Stat Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Career Readiness', value: readiness.overall || 0, icon: Target, isProgress: true, color: 'text-primary' },
          { label: 'Verified Skill Strength', value: skillStrength, icon: BarChart3, isProgress: true, color: 'text-primary' },
          { label: 'Active Job Matches', value: jobsCount, icon: Briefcase, isCount: true },
          { label: 'Tracked Applications', value: appsCount, icon: ListChecks, isCount: true },
        ].map((k, i) => (
          <Card
            key={k.label}
            delay={i * 0.05}
             className="p-5 flex flex-col justify-between"
          >
              {k.isCount ? (
              <div className="py-2 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-slate/20 bg-veryLightBlue text-primary">
                  <k.icon size={22} />
                </div>
                <div className="text-3xl font-bold tracking-tight text-navy">{k.value}</div>
                <div className="mt-1 text-xs font-semibold text-slate">{k.label}</div>
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
            className="card p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate/20 bg-veryLightBlue text-primary">
                <Zap size={20} />
              </div>
              <h4 className="mb-1.5 text-sm font-bold text-navy">Adaptive AI Quiz</h4>
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
            className="card p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate/20 bg-veryLightBlue text-primary">
                <MessageSquare size={20} />
              </div>
              <h4 className="mb-1.5 text-sm font-bold text-navy">AI Voice Mock Interview</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Practice realistic technical & architectural questions with browser speech-to-text.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate/10 pt-3 text-xs font-bold text-primary">
              <span>Start Interview</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/resume"
            className="card p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate/20 bg-veryLightBlue text-primary">
                <FileText size={20} />
              </div>
              <h4 className="mb-1.5 text-sm font-bold text-navy">ATS Resume Studio</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Audit keyword coverage and rewrite bullets with the Google X-Y-Z formula.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate/10 pt-3 text-xs font-bold text-primary">
              <span>Audit Resume</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/roadmap"
            className="card p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate/20 bg-veryLightBlue text-primary">
                <Route size={20} />
              </div>
              <h4 className="mb-1.5 text-sm font-bold text-navy">30-Day Learning Plan</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Weekly milestones with hands-on projects and AI micro-lessons.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate/10 pt-3 text-xs font-bold text-primary">
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
               <span className="text-xs font-semibold text-success">
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
