import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, ExternalLink, Bookmark, Linkedin, Sparkles,
  HelpCircle, ChevronDown, ChevronUp, Loader2, CheckCircle, FileText,
  MessageSquare, ArrowRight, ShieldAlert, Award
} from 'lucide-react';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MatchPanel from '../../components/jobs/MatchPanel';
import { useApp } from '../../context/AppContext';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prepLoading, setPrepLoading] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [prepExpanded, setPrepExpanded] = useState(false);
  const { showToast } = useApp();

  useEffect(() => {
    jobService.getJobDetails(id)
      .then((r) => {
        setJob(r.job);
        setMatch(r.match);
      })
      .catch((err) => {
        console.error(err);
        showToast('Could not load job details', 'error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (status = 'Saved') => {
    if (!job) return;
    setSaving(true);
    try {
      await applicationService.saveJob(job._id, match?.overallMatchPct || 0, status);
      showToast(`Added to your applications pipeline as "${status}"`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not save job', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyOnLinkedIn = async () => {
    if (!job) return;
    setSaving(true);
    try {
      await applicationService.applyAndTrackJob(job._id, match?.overallMatchPct || 0);
      showToast('Tracked as Applied in pipeline! Opening live LinkedIn posting...');
      const url = job.linkedInApplyUrl || job.externalUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not record application', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFetchInterviewPrep = async () => {
    if (interviewPrep) {
      setPrepExpanded(!prepExpanded);
      return;
    }
    setPrepLoading(true);
    try {
      const res = await jobService.getInterviewPrep(job._id);
      setInterviewPrep(res.prep);
      setPrepExpanded(true);
      showToast('AI interview questions generated!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not generate interview questions', 'error');
    } finally {
      setPrepLoading(false);
    }
  };

  const handleTailorResume = () => {
    navigate('/resume', {
      state: {
        targetRole: job.title,
        jobDescription: `${job.title} at ${job.company}\n\nRequired Skills: ${job.requiredSkills?.join(', ')}\n\nDescription:\n${job.description}`,
      },
    });
  };

  const handlePracticeQuestions = () => {
    navigate('/assessment');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate">
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <p className="text-sm">Analyzing job details and matching compatibility...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-slate mb-4">Job opportunity not found or has expired.</p>
        <Link to="/jobs" className="btn-secondary inline-flex">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 pb-12">
      <div className="lg:col-span-2 space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
            <span>{job.source === 'manual' ? 'Tracked Role' : 'Active Opportunity'}</span>
            <span>•</span>
            <span>{job.employmentType || 'Full-time'}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy">{job.title}</h1>
          <p className="text-slate font-medium text-base mt-1">{job.company}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate mt-3">
            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-lightSky text-primary text-xs font-semibold">{job.workMode}</span>
            <span>•</span>
            <span>{job.experienceRequired}</span>
            {job.salaryRange && (
              <>
                <span>•</span>
                <span className="font-semibold text-navy">{job.salaryRange}</span>
              </>
            )}
          </div>
          <p className="flex items-center gap-1 text-xs text-slate mt-2">
            <Clock size={12} /> Posted {new Date(job.postedDate).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Primary Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white border border-slate/15 shadow-xs">
          {job.linkedInApplyUrl && (
            <Button
              onClick={handleApplyOnLinkedIn}
              disabled={saving}
              className="!bg-[#0A66C2] hover:!brightness-95 text-white flex items-center gap-1.5"
            >
              <Linkedin size={16} /> Apply on LinkedIn & Live Track <ExternalLink size={14} />
            </Button>
          )}
          {job.externalUrl && (
            <a href={job.externalUrl} target="_blank" rel="noreferrer">
              <button className="btn-secondary">
                Company Portal <ExternalLink size={14} />
              </button>
            </a>
          )}
          <button
            onClick={() => handleSave('Saved')}
            disabled={saving}
            className="btn-secondary flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="animate-spin" size={15} /> : <Bookmark size={15} />}
            Track Application
          </button>
          <button
            onClick={handleTailorResume}
            className="px-4 py-2.5 rounded-xl border border-primary/40 bg-lightSky/60 hover:bg-lightSky text-primary text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles size={15} /> Tailor Resume with AI
          </button>
        </div>

        {/* AI Interview Questions Predictor */}
        <Card className="border-primary/30 bg-gradient-to-br from-white via-lightSky/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-navy text-sm sm:text-base">
                  AI Interview Questions & Concept Predictions
                </h3>
                <p className="text-xs text-slate">
                  Simulate technical and behavioral questions expected for {job.company}'s {job.title} role.
                </p>
              </div>
            </div>
            <button
              onClick={handleFetchInterviewPrep}
              disabled={prepLoading}
              className="btn-secondary !text-xs !py-2 shrink-0 flex items-center gap-1.5"
            >
              {prepLoading ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Predicting...
                </>
              ) : interviewPrep ? (
                prepExpanded ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> View ({interviewPrep.technicalQuestions?.length || 0})</>
              ) : (
                <><Sparkles size={14} className="text-primary" /> Generate Questions</>
              )}
            </button>
          </div>

          <AnimatePresence>
            {prepExpanded && interviewPrep && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 pt-4 border-t border-slate/15 space-y-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle size={14} /> High-Probability Technical & Architecture Questions
                  </h4>
                  <div className="space-y-2">
                    {interviewPrep.technicalQuestions?.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-slate/15 text-xs text-navy leading-relaxed">
                        <span className="font-bold text-primary mr-2">Q{idx + 1}.</span>
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award size={14} className="text-amber-500" /> Behavioral & STAR Scenarios
                  </h4>
                  <div className="space-y-2">
                    {interviewPrep.behavioralQuestions?.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate/5 border border-slate/10 text-xs text-navy leading-relaxed">
                        <span className="font-bold text-slate mr-2">Q{idx + 1}.</span>
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                {interviewPrep.companyTips && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    <strong>Interviewer Tip:</strong> {interviewPrep.companyTips}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button onClick={handlePracticeQuestions} className="!text-xs !py-2">
                    <MessageSquare size={14} /> Practice in AI Mock Interview <ArrowRight size={14} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Job Description */}
        <Card>
          <h3 className="font-bold text-navy mb-3 text-base">Job Description & Responsibilities</h3>
          <p className="text-sm text-slate leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </Card>

        {/* Skills Required & Preferred */}
        <Card>
          <h3 className="font-bold text-navy mb-3 text-sm uppercase tracking-wider text-slate">Core Required Competencies</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {job.requiredSkills?.map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-lg bg-lightSky text-primary text-xs font-semibold border border-primary/20">
                {s}
              </span>
            ))}
          </div>

          {job.preferredSkills?.length > 0 && (
            <>
              <h3 className="font-bold text-navy mb-3 text-sm uppercase tracking-wider text-slate">Preferred Nice-To-Have Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-lg bg-slate/5 text-slate text-xs font-medium border border-slate/15">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Match Panel Column */}
      <div className="space-y-6">
        <MatchPanel match={match} />
        
        <Card className="bg-slate/5 border-slate/15">
          <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">Application Checklist</h4>
          <ul className="text-xs text-slate space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Tailor resume bullets using Google's X-Y-Z formula
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Review missing required skills in Skill Gap analyzer
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Practice predicted interview questions with AI Voice
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default JobDetailsPage;

