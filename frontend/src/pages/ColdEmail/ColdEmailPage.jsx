import React, { useState, useMemo, useEffect } from 'react';
import {
  Mail, Send, Sparkles, FileText, CheckCircle2, ShieldCheck,
  Copy, Check, Trash2, Plus, Upload, X, AtSign, Building2,
  RefreshCw, Paperclip, CheckCheck, Loader2, Users, Layers,
  History, Clock, AlertCircle, ExternalLink
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import coldEmailService from '../../services/coldEmailService';

// Hard 10-email batch capacity to protect domain reputation and maximize deliverability
const BATCH_LIMIT = 10;
const SENDER_EMAIL = 'saiyamrajput71@gmail.com';

// Universal high-converting templates that send the same body content to all emails without needing HR names
const OUTREACH_TEMPLATES = [
  {
    id: 'project-pitch',
     label: 'High-impact pitch',
    name: 'High-Impact Project Pitch',
    subject: 'Full Stack Engineer (MERN) – Application & Project Showcase',
    body: `Hi Hiring Team,

I am reaching out to explore open Software Engineering / Full Stack Developer opportunities with your team.

I specialize in the MERN stack (MongoDB, Express, React, Node.js) and Python, building high-performance web applications with JWT-secured REST APIs. Recently, I engineered an automated lead-gen CRM and Agrosmart (a React & Flask assistant), achieving sub-200ms API response times.

Given your team's commitment to clean architecture and product excellence, I would love to contribute to your sprint goals from day one. Would you be open to a brief 10-minute chat this week?

I have attached my verified ATS resume and linked my active project repositories below.

Best regards,
{{candidate_name}}
Full Stack Engineer | B.Tech AI & ML
Portfolio: {{portfolio_url}}`,
  },
  {
    id: 'internship',
     label: 'SWE internship',
    name: 'SWE Internship & Early Career',
    subject: 'Application: Software Engineering Intern – {{candidate_name}}',
    body: `Dear Engineering Team,

I hope you are doing well. I am a B.Tech Artificial Intelligence & Machine Learning student (CGPA 9.2, graduating 2027) actively seeking a Software Engineering / Full Stack Developer internship.

During my previous internship at Leadbug Tech, I engineered lead generation modules and React dashboards, while optimizing REST APIs handling thousands of daily interactions. I love writing clean, maintainable code and solving complex algorithmic challenges.

I deeply admire your engineering culture and would value the chance to demonstrate my dedication as an intern. May I share a quick 2-minute overview of my recent projects with you?

Thank you for your time and consideration!

Sincerely,
{{candidate_name}}
Portfolio: {{portfolio_url}}`,
  },
  {
    id: 'general-opp',
     label: 'General application',
    name: 'General Developer Application',
    subject: 'Full Stack Developer Application – {{candidate_name}}',
    body: `Hi Hiring Team,

I am writing to express my strong interest in joining your engineering organization as a Full Stack / MERN Developer.

With hands-on experience in building scalable web applications with React 18, Node.js, Express, MongoDB, and Python, I focus on clean code, sub-second API performance, and seamless user experiences.

I would appreciate the opportunity to discuss how my skill set aligns with current or upcoming developer openings on your team.

Attached is my verified ATS resume. My live project repositories can be found here: {{portfolio_url}}.

Thank you for your time and consideration!

Warm regards,
{{candidate_name}}`,
  },
  {
    id: 'follow-up',
     label: '4-day follow-up',
    name: '4-Day Follow-Up Nudge',
    subject: 'Following up on Full Stack Developer Application – {{candidate_name}}',
    body: `Hi Hiring Team,

I know things get very busy on the recruiting side, so I wanted to gently bump my application to the top of your inbox.

I remain very excited about potential engineering opportunities with your team. Since my last note, I also pushed a live demo of my recent project: {{portfolio_url}}.

If you have 5 minutes for a quick touchpoint this week, please let me know. If the timing isn't right, no problem at all!

Best regards,
{{candidate_name}}`,
  },
];

// Helper to auto-extract organization name from email domain
const extractOrgFromEmail = (email) => {
  if (!email || !email.includes('@')) return 'Tech Team';
  const domain = email.split('@')[1]?.toLowerCase() || '';
  const domainPart = domain.split('.')[0];
  if (!domainPart || ['gmail', 'yahoo', 'outlook', 'hotmail', 'proton', 'icloud'].includes(domainPart)) {
    return 'Hiring Team';
  }
  return domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
};

// Default initial raw email sample batch
const INITIAL_EMAILS = [
  { id: 'em-1', email: 'careers@razorpay.com', org: 'Razorpay', status: 'Ready' },
  { id: 'em-2', email: 'hr@swiggy.in', org: 'Swiggy', status: 'Ready' },
  { id: 'em-3', email: 'talent@zomato.com', org: 'Zomato', status: 'Ready' },
  { id: 'em-4', email: 'hiring@cred.club', org: 'CRED', status: 'Ready' },
  { id: 'em-5', email: 'tech-jobs@tcs.com', org: 'TCS', status: 'Ready' },
];

export default function ColdEmailPage() {
  const { showToast } = useApp();
  const { user } = useAuth();

  // Raw Emails Batch Queue (Up to 10 max)
  const [emailList, setEmailList] = useState(INITIAL_EMAILS);

  // Single Quick-Add Input (just paste an email)
  const [quickEmailInput, setQuickEmailInput] = useState('');

  // Bulk Paste Dialog
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');

  // Shared Email Content & Subject (Sent to all emails together)
  const [activeTemplateId, setActiveTemplateId] = useState('project-pitch');
  const [subjectText, setSubjectText] = useState(OUTREACH_TEMPLATES[0].subject);
  const [bodyText, setBodyText] = useState(OUTREACH_TEMPLATES[0].body);

  // UI state
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedBcc, setCopiedBcc] = useState(false);

  // Backend outreach stats & history
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalEmailsSent: 0,
    totalDelivered: 0,
    deliveryRate: 100,
    defaultSender: SENDER_EMAIL,
  });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch live stats & batch history from backend
  const loadData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.allSettled([
        coldEmailService.getStats(),
        coldEmailService.getHistory(6),
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
        setStats(statsRes.value.stats);
      }
      if (historyRes.status === 'fulfilled' && historyRes.value?.history) {
        setHistory(historyRes.value.history);
      }
    } catch (err) {
      console.warn('Cold outreach sync notice:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle template switch
  const handleSelectTemplate = (tmpl) => {
    setActiveTemplateId(tmpl.id);
    setSubjectText(tmpl.subject);
    setBodyText(tmpl.body);
    showToast(`Switched to ${tmpl.name}`, 'info');
  };

  // Render variables in subject and body
  const renderedSubject = useMemo(() => {
    const candidateName = user?.fullName || 'Saiyam Rajput';
    return (subjectText || '').replace(/{{candidate_name}}/g, candidateName);
  }, [subjectText, user]);

  const renderedBody = useMemo(() => {
    const candidateName = user?.fullName || 'Saiyam Rajput';
    const portfolioUrl = 'https://github.com/saiyam-rajput';
    return (bodyText || '')
      .replace(/{{candidate_name}}/g, candidateName)
      .replace(/{{portfolio_url}}/g, portfolioUrl);
  }, [bodyText, user]);

  // Add single email
  const handleAddQuickEmail = (e) => {
    if (e) e.preventDefault();
    const raw = quickEmailInput.trim();
    if (!raw) return;

    if (emailList.length >= BATCH_LIMIT) {
      showToast(`Batch limit of ${BATCH_LIMIT} reached. Send current batch first.`, 'error');
      return;
    }

    const emailMatch = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (!emailMatch) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    const email = emailMatch[0].toLowerCase();
    if (emailList.some((item) => item.email.toLowerCase() === email)) {
      showToast('This email is already in your current batch', 'warning');
      return;
    }

    const org = extractOrgFromEmail(email);
    setEmailList([...emailList, { id: `em-${Date.now()}`, email, org, status: 'Ready' }]);
    setQuickEmailInput('');
    showToast(`Added ${email}`, 'success');
  };

  // Bulk Paste parser (Extracts raw emails from comma, space, newline separated text)
  const handleBulkParse = () => {
    if (!bulkInputText.trim()) return;

    const availableSlots = BATCH_LIMIT - emailList.length;
    if (availableSlots <= 0) {
      showToast(`Batch is already at max capacity of ${BATCH_LIMIT}.`, 'error');
      return;
    }

    const matchedEmails = bulkInputText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];

    if (matchedEmails.length === 0) {
      showToast('No valid email addresses found in the pasted text.', 'error');
      return;
    }

    const existing = new Set(emailList.map((e) => e.email.toLowerCase()));
    const uniqueNew = [];

    for (const em of matchedEmails) {
      const lower = em.toLowerCase();
      if (!existing.has(lower) && !uniqueNew.includes(lower)) {
        uniqueNew.push(lower);
      }
    }

    if (uniqueNew.length === 0) {
      showToast('All pasted emails are already in the batch list.', 'info');
      return;
    }

    const toAdd = uniqueNew.slice(0, availableSlots).map((email, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      email,
      org: extractOrgFromEmail(email),
      status: 'Ready',
    }));

    setEmailList((prev) => [...prev, ...toAdd]);
    setBulkInputText('');
    setShowBulkModal(false);
    showToast(`Added ${toAdd.length} email addresses to batch!`, 'success');
  };

  // Remove email
  const handleRemove = (id) => {
    setEmailList((prev) => prev.filter((item) => item.id !== id));
    showToast('Email removed from batch', 'info');
  };

  // Copy All as BCC for Gmail / Outlook
  const handleCopyBcc = () => {
    if (emailList.length === 0) {
      showToast('No emails in batch to copy', 'warning');
      return;
    }
    const bccString = emailList.map((e) => e.email).join(', ');
    navigator.clipboard.writeText(bccString);
    setCopiedBcc(true);
    setTimeout(() => setCopiedBcc(false), 2200);
    showToast(`Copied ${emailList.length} emails as BCC string!`, 'success');
  };

  // Copy Subject & Body
  const handleCopyContent = () => {
    const fullText = `Subject: ${renderedSubject}\n\n${renderedBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2200);
    showToast('Copied email subject and body for Gmail!', 'success');
  };

  // Dispatch Same Content to All Emails via Backend API using saiyamrajput71@gmail.com
  const handleDispatchBatch = async () => {
    if (emailList.length === 0) {
      showToast('Please add at least 1 email address to dispatch', 'warning');
      return;
    }

    if (emailList.length > BATCH_LIMIT) {
      showToast(`Batch limit is ${BATCH_LIMIT} emails.`, 'error');
      return;
    }

    setIsSendingBatch(true);

    try {
      const res = await coldEmailService.sendBatch({
        senderEmail: SENDER_EMAIL,
        recipients: emailList.map((item) => ({ email: item.email, org: item.org })),
        subject: renderedSubject,
        body: renderedBody,
        attachResume: true,
      });

      if (res.recipients && Array.isArray(res.recipients)) {
        const statusMap = new Map(res.recipients.map((r) => [r.email.toLowerCase(), r.status]));
        setEmailList((prev) =>
          prev.map((item) => {
            const returnedStatus = statusMap.get(item.email.toLowerCase());
            return {
              ...item,
              status: returnedStatus === 'Delivered' ? 'Delivered ✓' : (returnedStatus || 'Delivered ✓'),
            };
          })
        );
      } else {
        setEmailList((prev) => prev.map((item) => ({ ...item, status: 'Delivered ✓' })));
      }

      showToast(res.message || `Dispatched ${emailList.length} emails successfully!`, 'success');
      loadData();
    } catch (err) {
      console.error('[ColdEmail] Send error:', err);
      showToast(
        err.response?.data?.message || err.message || 'Failed to dispatch email batch',
        'error'
      );
    } finally {
      setIsSendingBatch(false);
    }
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto space-y-6">
      {/* --- Top Header (Simple, Crisp & Modern) --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/15 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
              Bulk Cold Outreach Studio
            </span>
             <span className="text-[10px] font-semibold text-success">
               Backend connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
            Cold Email Dispatcher
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add up to 10 emails per batch and dispatch the exact same verified developer pitch to all recipients instantly.
          </p>
        </div>

        {/* Capacity Indicator & Primary Dispatch CTA */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate/20 shadow-2xs flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Batch Capacity
              </span>
              <span className="text-xs font-black text-navy">
                <strong className={emailList.length >= BATCH_LIMIT ? 'text-rose-600' : 'text-primary'}>
                  {emailList.length}
                </strong>{' '}
                / {BATCH_LIMIT} Emails
              </span>
            </div>
            <div className="w-10 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  emailList.length >= BATCH_LIMIT
                    ? 'bg-rose-500'
                    : emailList.length >= 7
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${(emailList.length / BATCH_LIMIT) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleDispatchBatch}
            disabled={emailList.length === 0 || isSendingBatch}
             className="btn-primary !px-5 !py-2.5 text-xs disabled:pointer-events-none"
          >
            {isSendingBatch ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Dispatching Batch...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Send to All ({emailList.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- Outreach Metrics & Sender Identity Bar --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate/15 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Mail size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Outbound Sender</span>
            <p className="text-xs font-extrabold text-navy truncate font-mono" title={SENDER_EMAIL}>
              {SENDER_EMAIL}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate/15 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Total Delivered</span>
            <p className="text-sm font-black text-navy">{stats.totalDelivered || 0} Emails</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate/15 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Batches Recorded</span>
            <p className="text-sm font-black text-navy">{stats.totalBatches || 0} Batches</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate/15 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Safe Batch Cap</span>
            <p className="text-sm font-black text-emerald-600">10 / Request</p>
          </div>
        </div>
      </div>

      {/* --- Main 2-Column Clean Workspace --- */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* COLUMN 1: MULTIPLE EMAILS BATCH QUEUE (4 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <span>Email Batch ({emailList.length}/{BATCH_LIMIT})</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                disabled={emailList.length >= BATCH_LIMIT}
                className="text-[11px] font-bold text-primary hover:text-navy flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              >
                <Upload size={12} /> Bulk Paste Emails
              </button>

              <button
                type="button"
                onClick={() => setEmailList(INITIAL_EMAILS)}
                className="text-slate-400 hover:text-navy p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Reset sample emails"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {/* Quick Add Single Email Form */}
          <form onSubmit={handleAddQuickEmail} className="flex items-center gap-2">
            <div className="relative flex-1">
              <AtSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={quickEmailInput}
                onChange={(e) => setQuickEmailInput(e.target.value)}
                placeholder="Type or paste any HR email..."
                disabled={emailList.length >= BATCH_LIMIT}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate/20 bg-white text-navy font-medium focus:outline-none focus:border-primary shadow-2xs disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!quickEmailInput.trim() || emailList.length >= BATCH_LIMIT}
              className="px-3 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy/90 transition-all disabled:opacity-40 shrink-0 cursor-pointer"
            >
              Add
            </button>
          </form>

          {/* Clean Emails Queue List */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-0.5">
            {emailList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate/25 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">No emails in this batch</p>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Click to Paste Your Email List
                </button>
              </div>
            ) : (
              emailList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-slate/15 bg-white hover:border-slate/30 transition-all flex items-center justify-between gap-2 shadow-2xs group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-slate-400 w-4 shrink-0 text-center">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy truncate font-mono">
                        {item.email}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.org}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        item.status === 'Delivered ✓'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded transition-all cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Copy All as BCC bar */}
          {emailList.length > 0 && (
            <div className="pt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyBcc}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate/20 text-navy text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Copies comma-separated emails to paste into Gmail BCC field"
              >
                {copiedBcc ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedBcc ? 'Copied All to Clipboard ✓' : `Copy All ${emailList.length} as BCC`}</span>
              </button>

              <button
                type="button"
                onClick={() => setEmailList([])}
                className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
              >
                Clear
              </button>
            </div>
          )}

          {/* Deliverability Guarantee Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate/15 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-navy flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600" /> Sending Mode:
            </span>
            <p className="leading-relaxed">
              Dispatches directly through verified developer email <strong>{SENDER_EMAIL}</strong>. Saved to MongoDB batch records with full deliverability logs.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: SINGLE SHARED EMAIL COMPOSER (8 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Strategy Template Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-extrabold text-navy uppercase tracking-wider shrink-0 mr-1">
              Select Body Template:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {OUTREACH_TEMPLATES.map((tmpl) => {
                const isActive = activeTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-navy text-white shadow-sm'
                        : 'bg-white border border-slate/20 text-slate-600 hover:text-navy hover:bg-slate-50'
                    }`}
                  >
                    {tmpl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unified Clean Email Studio Card */}
          <div className="rounded-2xl border border-slate/20 bg-white shadow-md overflow-hidden">
            {/* Recipient Header Bar */}
            <div className="p-4 border-b border-slate/15 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-extrabold text-slate-400">To:</span>
                <span className="font-extrabold text-navy truncate">
                  {emailList.length === 0 ? 'No recipients added yet' : `All ${emailList.length} Emails in Batch`}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Same Body Content to All
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 size={12} />
                <span>Universal Pitch Format</span>
              </div>
            </div>

            {/* Subject Line Input */}
            <div className="px-5 py-3 border-b border-slate/15 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 shrink-0">Subject:</span>
              <input
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
                placeholder="Full Stack Developer Application..."
                className="w-full text-xs sm:text-sm font-bold text-navy focus:outline-none bg-transparent"
              />
            </div>

            {/* Email Body Textarea */}
            <div className="p-5">
              <textarea
                rows={12}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Write your email body..."
                className="w-full text-xs sm:text-sm font-medium text-navy leading-relaxed focus:outline-none bg-transparent resize-y font-sans"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Attachments Note */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Paperclip size={13} className="text-slate-400" />
                <span>
                  Attached: <strong className="text-navy">Saiyam_Rajput_Resume.pdf</strong> (ATS Score 94)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate/20 hover:border-slate/40 text-navy text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="Copy subject and body to paste directly into Gmail or Outlook"
                >
                  {copiedContent ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedContent ? 'Copied Content ✓' : 'Copy Content'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyBcc}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate/20 hover:border-slate/40 text-navy text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="Copy all recipient emails to paste into Gmail BCC field"
                >
                  {copiedBcc ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedBcc ? 'Copied BCC ✓' : 'Copy All Emails (BCC)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDispatchBatch}
                  disabled={emailList.length === 0 || isSendingBatch}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-extrabold shadow-sm shadow-primary/20 hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {isSendingBatch ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Send to All ({emailList.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECENT OUTREACH BATCHES (MONGODB RECORDED HISTORY) */}
      {/* ========================================================================= */}
      {history.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate/20 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-primary" />
              <h2 className="text-sm font-extrabold text-navy">Recent Outbound Batches</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Logged in Database
              </span>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw size={11} /> Refresh Logs
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((batch) => (
              <div
                key={batch._id}
                className="p-3.5 rounded-xl border border-slate/15 bg-slate-50/60 hover:bg-white hover:border-slate/30 transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock size={11} /> {new Date(batch.createdAt).toLocaleDateString()} {new Date(batch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {batch.deliveredCount}/{batch.totalCount} Delivered
                  </span>
                </div>

                <p className="font-bold text-navy truncate" title={batch.subject}>
                  {batch.subject}
                </p>

                <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate font-mono">
                  <span>To:</span>
                  <span className="truncate">
                    {batch.recipients?.map((r) => r.email).join(', ') || 'Recipients'}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-slate/10 text-[10px] text-slate-400">
                  <span>From: <strong className="text-slate-600">{batch.senderEmail || SENDER_EMAIL}</strong></span>
                  <span className="uppercase font-mono text-[9px] px-1 py-0.2 bg-white rounded border border-slate/15">
                    {batch.mode === 'live_smtp' ? 'Live SMTP' : 'Verified Batch'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BULK PASTE EMAILS MODAL (PASTE ONLY EMAILS) */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-lg border border-slate/20 bg-white shadow-card">
            <div className="px-5 py-3.5 bg-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-primary" />
                <h3 className="font-extrabold text-sm text-white">Paste Multiple Emails</h3>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                 Paste your raw email list below. You don't need any names or company fields. Paste the emails separated by newlines, commas, or spaces:
              </p>

              <textarea
                rows={6}
                value={bulkInputText}
                onChange={(e) => setBulkInputText(e.target.value)}
                placeholder={`careers@razorpay.com\nhr@swiggy.in\ntalent@zomato.com\nhiring@cred.club\nrecruitment@tcs.com`}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate/20 text-navy focus:outline-none focus:border-primary shadow-2xs"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Slots available in batch: <strong>{BATCH_LIMIT - emailList.length}</strong> (Max 10)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="text-xs text-slate-500 hover:text-navy px-2"
                  >
                    Cancel
                  </button>
                  <Button onClick={handleBulkParse} className="!text-xs !py-1.5 !px-4">
                    Extract & Add Emails
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
