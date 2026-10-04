import React, { useState } from 'react';
import { CheckCircle2, X, Sparkles, Zap, BookOpen, Loader2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import assessmentService from '../../services/assessmentService';

const SkillNodeDetail = ({ skill, onClose }) => {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  if (!skill) return null;

  const handleFetchLesson = async () => {
    setLessonLoading(true);
    try {
      const data = await assessmentService.getLesson(skill.name);
      setLesson(data);
    } catch (err) {
      setLesson({
        title: `${skill.name} Quick Primer`,
        content: `Mastering ${skill.name} requires understanding fundamental patterns, runtime trade-offs, and common pitfalls evaluated in technical interviews for your target role.`,
        generated_by: 'local fallback',
      });
    } finally {
      setLessonLoading(false);
    }
  };

  const handleLaunchQuiz = () => {
    navigate('/assessment');
  };

  return (
    <div className="card sticky top-24 max-h-[85vh] overflow-y-auto space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-xl text-navy flex items-center gap-2">
            {skill.name}
            {skill.source === 'ai-detected' && (
              <span title="Discovered automatically by AI from your resume — not part of the default skill list">
                <Badge variant="primary"><Sparkles size={11} className="inline mr-0.5" /> AI-detected</Badge>
              </span>
            )}
          </h3>
          <span className="text-xs text-slate">{skill.category} · {skill.difficulty}</span>
        </div>
        <button onClick={onClose} className="text-slate hover:text-navy p-1 rounded-lg hover:bg-slate/10"><X size={18} /></button>
      </div>

      <div className="space-y-3.5">
        <ProgressBar value={skill.level} label="Your Current Level" />
        {skill.requiredLevel !== undefined && (
          <ProgressBar value={skill.requiredLevel} label="Role Required Level" colorClass="bg-navy" />
        )}
        {skill.gap !== undefined && (
          <div className="flex items-center justify-between text-sm py-1 border-y border-slate/10">
            <span className="text-slate font-medium">Competency Gap</span>
            <Badge variant={skill.gap > 30 ? 'danger' : skill.gap > 10 ? 'warning' : 'success'}>
              {skill.gap > 0 ? `-${skill.gap}% Gap` : 'Target Met'}
            </Badge>
          </div>
        )}

        {/* 1-Click AI Actions */}
        <div className="pt-1 flex flex-col gap-2">
          <Button onClick={handleLaunchQuiz} className="w-full !py-2 text-xs flex items-center justify-center gap-1.5 font-bold">
            <Zap size={14} /> Take AI Assessment for {skill.name}
          </Button>

          {!lesson ? (
            <button
              onClick={handleFetchLesson}
              disabled={lessonLoading}
              className="btn-secondary w-full !py-2 text-xs flex items-center justify-center gap-1.5 font-semibold"
            >
              {lessonLoading ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
              Generate AI Micro-Lesson
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-lightSky/50 border border-primary/20 space-y-1.5 text-xs animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-primary">
                <span className="flex items-center gap-1"><Sparkles size={12} /> {lesson.title}</span>
                <button onClick={() => setLesson(null)} className="text-slate/60 hover:text-slate">Close</button>
              </div>
              <p className="text-slate leading-relaxed whitespace-pre-wrap">{lesson.content}</p>
              {lesson.generated_by && (
                <span className="text-[10px] text-slate/50 block">AI Model: {lesson.generated_by}</span>
              )}
            </div>
          )}
        </div>

        {skill.prerequisites?.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-slate uppercase tracking-wider mb-1.5">Prerequisites</p>
            <div className="flex flex-wrap gap-1.5">
              {skill.prerequisites.map((p) => (
                <span key={p} className="flex items-center gap-1 text-xs bg-success/10 text-success px-2.5 py-1 rounded-lg font-medium">
                  <CheckCircle2 size={12} /> {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {skill.relatedSkills?.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-slate uppercase tracking-wider mb-1.5">Adjacent / Related Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skill.relatedSkills.map((r) => (
                <span key={r} className="text-xs bg-veryLightBlue text-navy px-2.5 py-1 rounded-lg font-medium border border-slate/10">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate/10 flex items-center justify-between text-xs text-slate">
          <span>Market Demand: <strong className="text-navy">{skill.marketDemand}</strong></span>
          <span className="capitalize text-slate/80">State: <strong className="text-primary">{skill.state || 'Active'}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default SkillNodeDetail;
