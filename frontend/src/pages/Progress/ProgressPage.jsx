import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, Award, BriefcaseBusiness, CheckCircle2, GraduationCap, Sparkles, Target, TrendingUp } from 'lucide-react';
import progressService from '../../services/progressService';
import Card from '../../components/ui/Card';

const formatHistory = (history = []) => {
  const grouped = new Map();
  [...history].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((entry) => {
    const date = new Date(entry.date);
    if (Number.isNaN(date.getTime())) return;
    const key = date.toISOString().slice(0, 10);
    grouped.set(key, { date: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date), value: entry.level });
  });
  return [...grouped.values()];
};

const Metric = ({ icon: Icon, label, value, accent, note }) => <Card className="progress-metric-card">
  <div className={`progress-metric-icon ${accent}`}><Icon size={19} /></div>
  <div><p className="text-2xl font-extrabold text-navy tracking-tight">{value}</p><p className="text-sm font-semibold text-slate">{label}</p>{note && <p className="text-xs text-slate/65 mt-1">{note}</p>}</div>
</Card>;

const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => { progressService.getMyProgress().then(setData).catch(() => setData({ skillProgressOverTime: [], careerReadiness: 0, coursesCompleted: 0, avgAssessmentScore: 0, applicationsCount: 0, assessmentsCompleted: 0 })); }, []);

  const skills = data?.skillProgressOverTime || [];
  const activeSkill = skills.find((skill) => skill.skill === selectedSkill) || skills[0];
  const trend = useMemo(() => formatHistory(activeSkill?.history), [activeSkill]);
  const snapshots = useMemo(() => skills.map((skill) => ({ skill: skill.skill, level: skill.history?.[skill.history.length - 1]?.level || 0 })).sort((a, b) => b.level - a.level).slice(0, 6), [skills]);

  if (!data) return <div className="py-20 text-center text-slate">Loading your progress workspace…</div>;
  const readinessMessage = data.careerReadiness >= 70 ? 'You are building strong momentum.' : data.careerReadiness > 0 ? 'Focus on your next critical skill.' : 'Set a target role to unlock readiness insights.';

  return <div className="max-w-7xl mx-auto progress-page">
    <motion.section initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="progress-hero">
      <div><div className="eyebrow"><Sparkles size={14} /> Career intelligence</div><h1>Progress, with a purpose.</h1><p>See what is moving forward and choose the next action that improves your career readiness.</p></div>
      <div className="progress-hero-readiness"><span>Career readiness</span><strong>{data.careerReadiness}%</strong><div><i style={{ width: `${Math.min(100, data.careerReadiness)}%` }} /></div><p>{readinessMessage}</p></div>
    </motion.section>

    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
      <Metric icon={Target} value={`${data.careerReadiness}%`} label="Career readiness" accent="metric-blue" note="Aligned to your target role" />
      <Metric icon={Award} value={`${data.avgAssessmentScore}%`} label="Assessment average" accent="metric-violet" note={`${data.assessmentsCompleted} completed`} />
      <Metric icon={GraduationCap} value={data.coursesCompleted} label="Learning milestones" accent="metric-amber" note="Roadmap items completed" />
      <Metric icon={BriefcaseBusiness} value={data.applicationsCount} label="Applications tracked" accent="metric-emerald" note="Keep your pipeline active" />
    </section>

    <section className="grid xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,0.75fr)] gap-5 mt-5">
      <Card className="p-0 overflow-hidden">
        <div className="progress-card-heading"><div><p className="eyebrow text-primary"><TrendingUp size={14} /> Skill trajectory</p><h2>{activeSkill ? `${activeSkill.skill} progress` : 'Your skill trajectory'}</h2><p>{trend.length > 1 ? 'Your latest checkpoint is shown for each recorded day.' : 'Complete an assessment or update a skill to create your trend.'}</p></div>
          {skills.length > 1 && <select value={activeSkill?.skill || ''} onChange={(e) => setSelectedSkill(e.target.value)} className="progress-select" aria-label="Choose a skill">{skills.map((skill) => <option key={skill.skill} value={skill.skill}>{skill.skill}</option>)}</select>}
        </div>
        <div className="px-3 sm:px-5 pb-5 h-[290px]">
          {trend.length > 1 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}><defs><linearGradient id="progressGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.24} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#E8F1FD" /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} /><Tooltip cursor={{ stroke: '#93C5FD', strokeWidth: 1 }} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(15,23,42,.08)' }} formatter={(value) => [`${value}%`, 'Skill level']} /><Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} fill="url(#progressGradient)" activeDot={{ r: 5, fill: '#fff', stroke: '#2563EB', strokeWidth: 3 }} /></AreaChart></ResponsiveContainer> : <div className="h-full flex flex-col items-center justify-center text-center px-6"><div className="w-12 h-12 rounded-2xl bg-lightSky text-primary flex items-center justify-center mb-3"><TrendingUp size={23} /></div><p className="font-bold text-navy">Your trend starts with one action</p><p className="text-sm text-slate max-w-sm mt-1">Take an assessment, upload a resume, or update a roadmap task. We will turn those checkpoints into a clear timeline.</p>{activeSkill && <div className="mt-4 px-3 py-2 rounded-lg bg-slate-50 text-xs text-slate"><span className="font-bold text-navy">Latest {activeSkill.skill} level:</span> {trend[0]?.value || 0}%</div>}</div>}
        </div>
      </Card>

      <Card className="skill-snapshot-card"><div className="progress-card-heading !p-0 mb-4"><div><p className="eyebrow text-primary"><Target size={14} /> Skill snapshot</p><h2>Where you are now</h2></div></div>
        {snapshots.length ? <div className="space-y-4">{snapshots.map((item, index) => <div key={item.skill}><div className="flex justify-between items-center text-sm mb-1.5"><span className="font-semibold text-navy truncate pr-3">{item.skill}</span><span className="font-bold text-primary">{item.level}%</span></div><div className="skill-level-track"><span style={{ width: `${Math.max(2, Math.min(100, item.level))}%` }} className={index === 0 ? 'top-skill' : ''} /></div></div>)}</div> : <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate">No skills recorded yet. Upload your resume to create your first skill snapshot.</div>}
      </Card>
    </section>

    <section className="grid md:grid-cols-2 gap-5 mt-5">
      <Card className="next-step-card"><div className="next-step-icon"><CheckCircle2 size={20} /></div><div><p className="eyebrow text-primary">Recommended next step</p><h2>{data.avgAssessmentScore ? 'Use your results to guide practice' : 'Take your first skill assessment'}</h2><p>{data.avgAssessmentScore ? 'Practice your lowest-scoring skill to improve the next readiness checkpoint.' : 'A short assessment gives your roadmap and skill graph much better recommendations.'}</p></div><Link to="/assessment" className="next-step-action">Start practice <ArrowUpRight size={16} /></Link></Card>
      <Card className="insight-card"><p className="eyebrow text-primary"><Sparkles size={14} /> Progress signal</p><h2>{readinessMessage}</h2><p>Readiness combines your recorded skills with the requirements of your target role. Add real activity regularly for a more accurate picture.</p></Card>
    </section>
  </div>;
};

export default ProgressPage;
