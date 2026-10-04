import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ResumeUploader from '../../components/resume/ResumeUploader';
import ResumeAnalysis from '../../components/resume/ResumeAnalysis';
import AtsScoreChecker from '../../components/resume/AtsScoreChecker';
import resumeService from '../../services/resumeService';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  FilePlus2, Loader2, Printer, Wand2, Sparkles, Copy,
  Check, ArrowRight, Zap, Target, ShieldCheck
} from 'lucide-react';


const ResumePage = () => {
  const location = useLocation();
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [contactDetails, setContactDetails] = useState({ phone: '', location: '', linkedin: '', portfolio: '' });
  const [generating, setGenerating] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [draft, setDraft] = useState(null);

  // Google X-Y-Z Bullet Rewriter state
  const [bulletInput, setBulletInput] = useState('');
  const [rewritingBullet, setRewritingBullet] = useState(false);
  const [rewrittenBulletResult, setRewrittenBulletResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const { showToast } = useApp();

  useEffect(() => {
    resumeService.getMyResume().then((r) => setResume(r.resume)).finally(() => setLoading(false));
  }, []);

  // Check incoming router state (e.g. from JobDetailsPage "Tailor Resume")
  useEffect(() => {
    if (location.state?.targetRole) {
      setTargetRole(location.state.targetRole);
    }
    if (location.state?.jobDescription) {
      setJobDescription(location.state.jobDescription);
    }
  }, [location.state]);

  const handleFileSelected = async (file) => {
    setUploading(true);
    setProgress(0);
    try {
      const { resume } = await resumeService.uploadResume(file, setProgress);
      setResume(resume);
      showToast('Resume uploaded successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const createDraft = async () => {
    if (!targetRole.trim()) return showToast('Enter the role you are targeting', 'error');
    setGenerating(true);
    try {
      const result = await resumeService.generate({ targetRole, jobDescription, details: contactDetails });
      setDraft(result.draft);
      showToast('ATS-friendly resume draft created. Please review every fact.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create resume draft', 'error');
    } finally { setGenerating(false); }
  };

  const reviewResume = async () => {
    if (!resume) return showToast('Upload a resume first', 'error');
    setReviewing(true);
    try {
      const { analysis } = await resumeService.reviewForJob(jobDescription, targetRole);
      setResume((current) => ({ ...current, resumeScore: analysis.atsScore, aiAnalysis: analysis }));
      showToast('ATS review updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not review resume', 'error');
    } finally { setReviewing(false); }
  };

  const handleRewriteBullet = async () => {
    if (!bulletInput.trim()) {
      showToast('Please enter a draft bullet point to transform', 'error');
      return;
    }
    setRewritingBullet(true);
    try {
      const res = await resumeService.rewriteBullet(bulletInput, targetRole || 'Software Engineer');
      setRewrittenBulletResult(res.result);
      showToast('Bullet point transformed with Google X-Y-Z formula!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not rewrite bullet', 'error');
    } finally {
      setRewritingBullet(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard!');
  };

  return (
    <div className="pb-12">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy">AI Resume & ATS Studio</h1>
        <p className="text-slate mt-1">Upload your resume to extract skills, analyze ATS match score, and power up bullet points with Google's X-Y-Z formula.</p>
      </motion.div>

      <div className="max-w-2xl mx-auto mb-8">
        <ResumeUploader onFileSelected={handleFileSelected} uploading={uploading} progress={progress} />
      </div>

      {!loading && resume ? (
        <div className="space-y-8">
          <ResumeAnalysis
            resume={resume}
            onScoreUpdated={(updated) => setResume(updated)}
          />
        </div>
      ) : (
        !loading && !uploading && (
          <div className="space-y-8">
            <Card className="text-center py-6 border-dashed border-slate/30">
              <p className="text-slate text-sm font-medium">
                Upload your resume above for full automated extraction, or test raw draft text below:
              </p>
            </Card>
            <div className="max-w-4xl mx-auto">
              <AtsScoreChecker
                defaultRole={targetRole || 'Full Stack Developer'}
                onScoreUpdated={(newScore) => {}}
              />
            </div>
          </div>
        )
      )}

      {/* AI Google X-Y-Z Bullet Point Power Rewriter */}
      <Card className="max-w-4xl mx-auto mt-8 border-primary/30 bg-gradient-to-br from-white via-lightSky/10 to-transparent">
        <div className="flex items-center gap-2 mb-2">


          <Zap className="text-primary" size={20} />
          <h2 className="font-bold text-navy text-lg">Google X-Y-Z Formula Bullet Rewriter</h2>
        </div>
        <p className="text-xs text-slate mb-4 leading-relaxed">
          Top tech recruiters at Google, Meta, and Amazon look for: <strong className="text-navy">"Accomplished [X] as measured by [Y], by doing [Z]"</strong>.
          Paste any draft or weak bullet point below and AI will transform it into an executive, high-impact accomplishment.
        </p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Target Role (e.g. Full Stack Developer, Data Engineer)"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="sm:w-1/3 rounded-xl border border-slate/20 px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder="e.g. Worked on frontend components and improved loading speed"
              value={bulletInput}
              onChange={(e) => setBulletInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRewriteBullet()}
              className="flex-1 rounded-xl border border-slate/20 px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
            <Button
              onClick={handleRewriteBullet}
              disabled={rewritingBullet || !bulletInput.trim()}
              className="!text-xs !py-2 shrink-0"
            >
              {rewritingBullet ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
              Power Up with AI
            </Button>
          </div>

          {rewrittenBulletResult && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white border border-primary/30 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                    Transformed Executive Bullet
                  </span>
                  <p className="text-sm font-semibold text-navy leading-relaxed">
                    • {rewrittenBulletResult.rewritten}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(rewrittenBulletResult.rewritten)}
                  className="px-3 py-1.5 rounded-lg border border-slate/20 hover:border-primary text-xs font-semibold text-slate hover:text-primary flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {rewrittenBulletResult.breakdown && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate/10 text-[11px]">
                  <span className="px-2.5 py-1 rounded-md bg-lightSky text-primary font-medium">
                    [X] Action: {rewrittenBulletResult.breakdown.actionVerb}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                    [Y] Metric: {rewrittenBulletResult.breakdown.impactMetric}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate/10 text-slate font-medium">
                    [Z] Tech: {rewrittenBulletResult.breakdown.techStack}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>

      {/* Gemini Resume Studio: Review & ATS Generator */}
      <Card className="max-w-4xl mx-auto mt-8">
        <div className="flex items-center gap-2 mb-1">
          <Wand2 className="text-primary" size={20} />
          <h2 className="font-bold text-navy text-lg">Gemini Resume Studio</h2>
        </div>
        <p className="text-sm text-slate mb-4">
          Tailor an ATS review to a specific job description or generate a clean, fact-grounded resume draft.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target role, e.g. Frontend Developer"
            className="rounded-xl border border-slate/20 px-3 py-2.5 text-sm"
          />
          <input
            value={contactDetails.phone}
            onChange={(e) => setContactDetails((d) => ({ ...d, phone: e.target.value }))}
            placeholder="Phone (optional)"
            className="rounded-xl border border-slate/20 px-3 py-2.5 text-sm"
          />
          <input
            value={contactDetails.location}
            onChange={(e) => setContactDetails((d) => ({ ...d, location: e.target.value }))}
            placeholder="Location (optional)"
            className="rounded-xl border border-slate/20 px-3 py-2.5 text-sm"
          />
          <input
            value={contactDetails.linkedin}
            onChange={(e) => setContactDetails((d) => ({ ...d, linkedin: e.target.value }))}
            placeholder="LinkedIn URL (optional)"
            className="rounded-xl border border-slate/20 px-3 py-2.5 text-sm"
          />
        </div>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={5}
          placeholder="Paste job description for keyword matching and tailoring (optional)"
          className="w-full mt-3 rounded-xl border border-slate/20 p-3 text-sm"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={reviewResume} disabled={!resume || reviewing}>
            {reviewing ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />} Review uploaded resume
          </Button>
          <button onClick={createDraft} disabled={generating} className="btn-secondary">
            {generating ? <Loader2 className="animate-spin" size={16} /> : <FilePlus2 size={16} />} Create new ATS template
          </button>
        </div>
      </Card>

      {draft && <ResumeDraft draft={draft} onPrint={() => window.print()} />}
    </div>
  );
};

const ResumeDraft = ({ draft, onPrint }) => (
  <Card className="max-w-4xl mx-auto mt-6 print:shadow-none">
    <div className="flex justify-between items-start mb-5 print:hidden">
      <div>
        <h2 className="font-bold text-navy text-lg">Generated ATS Template</h2>
        <p className="text-xs text-slate">Review and correct facts before exporting.</p>
      </div>
      <button onClick={onPrint} className="btn-secondary">
        <Printer size={16} /> Print / Save PDF
      </button>
    </div>
    <article className="max-w-3xl mx-auto text-slate text-sm leading-relaxed">
      <header className="border-b-2 border-primary pb-3 mb-4">
        <h1 className="text-2xl font-extrabold text-navy">{draft.basics?.name || 'Your Name'}</h1>
        <p className="font-semibold text-primary">{draft.basics?.title || ''}</p>
        <p className="text-xs">{[draft.basics?.email, draft.basics?.phone, draft.basics?.location, draft.basics?.linkedin].filter(Boolean).join(' · ')}</p>
      </header>
      {draft.summary && <Section title="Professional Summary"><p>{draft.summary}</p></Section>}
      {draft.skills?.length > 0 && <Section title="Skills"><p>{draft.skills.join(' · ')}</p></Section>}
      {draft.experience?.length > 0 && (
        <Section title="Experience">
          {draft.experience.map((item, i) => (
            <div key={i} className="mb-3">
              <p className="font-bold text-navy">{item.title} {item.company ? `— ${item.company}` : ''}</p>
              <p className="text-xs">{item.duration}</p>
              <ul className="list-disc list-outside ml-4">{item.bullets?.map((bullet, j) => <li key={j}>{bullet}</li>)}</ul>
            </div>
          ))}
        </Section>
      )}
      {draft.projects?.length > 0 && (
        <Section title="Projects">
          {draft.projects.map((item, i) => (
            <div key={i} className="mb-2">
              <p className="font-bold text-navy">{item.name}</p>
              <p>{item.description}</p>
              {item.skills?.length > 0 && <p className="text-xs">{item.skills.join(', ')}</p>}
            </div>
          ))}
        </Section>
      )}
      {draft.education?.length > 0 && (
        <Section title="Education">
          {draft.education.map((item, i) => (
            <p key={i}><span className="font-bold text-navy">{item.school}</span> — {item.degree} {item.year && `(${item.year})`}</p>
          ))}
        </Section>
      )}
      {draft.certifications?.length > 0 && <Section title="Certifications"><p>{draft.certifications.join(' · ')}</p></Section>}
    </article>
  </Card>
);

const Section = ({ title, children }) => (
  <section className="mb-4">
    <h2 className="uppercase tracking-wide text-xs font-bold text-primary border-b border-slate/20 pb-1 mb-2">{title}</h2>
    {children}
  </section>
);

export default ResumePage;

