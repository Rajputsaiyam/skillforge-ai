import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListChecks, Plus, Sparkles, MapPin, Building, ExternalLink,
  Trash2, X, ChevronRight, CheckCircle2, AlertCircle, Loader2,
  HelpCircle, Search, Filter, Linkedin, RefreshCw, Radio, Clock, Users
} from 'lucide-react';
import applicationService from '../../services/applicationService';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const COLUMNS = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add manual application modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '',
    company: '',
    location: 'Remote',
    workMode: 'Remote',
    status: 'Applied',
    notes: '',
  });
  const [adding, setAdding] = useState(false);

  // AI Stage Guidance & Details drawer
  const [selectedApp, setSelectedApp] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingSingle, setSyncingSingle] = useState(false);

  const { showToast } = useApp();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    applicationService.getMyApplications()
      .then((r) => setApplications(r.applications || []))
      .catch((err) => {
        console.error(err);
        showToast('Could not load applications', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSyncAllLinkedIn = async () => {
    setSyncingAll(true);
    try {
      const res = await applicationService.syncAllLinkedIn();
      if (res.applications) {
        setApplications(res.applications);
      }
      showToast('Synchronized live status from LinkedIn!');
    } catch (err) {
      showToast('Could not sync LinkedIn status', 'error');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncSingleLinkedIn = async (appId) => {
    setSyncingSingle(true);
    try {
      const res = await applicationService.syncLinkedInStatus(appId);
      if (res.application) {
        setApplications((prev) => prev.map((a) => (a._id === appId ? res.application : a)));
        if (selectedApp?._id === appId) {
          setSelectedApp(res.application);
        }
      }
      showToast('Live LinkedIn tracking updated!');
    } catch (err) {
      showToast('Could not update live status', 'error');
    } finally {
      setSyncingSingle(false);
    }
  };

  const handleDrop = async (status) => {
    if (!dragId) return;
    try {
      await applicationService.updateStatus(dragId, status);
      setApplications((prev) => prev.map((a) => (a._id === dragId ? { ...a, status } : a)));
      showToast(`Moved to ${status}`);
    } catch (err) {
      showToast('Could not update status', 'error');
    } finally {
      setDragId(null);
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.company.trim()) {
      showToast('Please provide both Job Title and Company', 'error');
      return;
    }
    setAdding(true);
    try {
      const res = await applicationService.addManualApplication(addForm);
      setApplications((prev) => [res.application, ...prev]);
      setIsAddOpen(false);
      setAddForm({
        title: '',
        company: '',
        location: 'Remote',
        workMode: 'Remote',
        status: 'Applied',
        notes: '',
      });
      showToast('Application added to pipeline!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add application', 'error');
    } finally {
      setAdding(false);
    }
  };

  const openAppDetails = async (app) => {
    setSelectedApp(app);
    setGuidance(null);
    setGuidanceLoading(true);
    try {
      const res = await applicationService.getStageGuidance(app.status, {
        jobTitle: app.job?.title,
        company: app.job?.company,
      });
      setGuidance(res.guidance);
    } catch (err) {
      console.error(err);
    } finally {
      setGuidanceLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Remove this application from tracking?')) return;
    try {
      await applicationService.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
      if (selectedApp?._id === id) setSelectedApp(null);
      showToast('Application removed');
    } catch (err) {
      showToast('Could not delete application', 'error');
    }
  };

  const handleStatusChangeFromDrawer = async (newStatus) => {
    if (!selectedApp) return;
    try {
      await applicationService.updateStatus(selectedApp._id, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a._id === selectedApp._id ? { ...a, status: newStatus } : a))
      );
      setSelectedApp({ ...selectedApp, status: newStatus });
      showToast(`Updated to ${newStatus}`);
      // Refresh AI guidance for the new stage
      setGuidanceLoading(true);
      const res = await applicationService.getStageGuidance(newStatus, {
        jobTitle: selectedApp.job?.title,
        company: selectedApp.job?.company,
      });
      setGuidance(res.guidance);
    } catch (err) {
      showToast('Could not update status', 'error');
    } finally {
      setGuidanceLoading(false);
    }
  };

  const filteredApps = applications.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.job?.title?.toLowerCase().includes(q) ||
      a.job?.company?.toLowerCase().includes(q) ||
      a.notes?.toLowerCase().includes(q)
    );
  });

  if (!loading && applications.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Application Pipeline</h1>
            <p className="text-slate mt-1">Track and strategize every job application with stage-by-stage AI coaching.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Track External Application
          </Button>
        </div>

        <EmptyState
          icon={ListChecks}
          title="No applications in pipeline yet"
          description="Track external applications you applied to on LinkedIn, or save verified roles from the Jobs portal."
          ctaLabel="Explore Verified Jobs"
          onCta={() => navigate('/jobs')}
        />

        {/* Add Modal */}
        {isAddOpen && (
          <ManualAppModal
            form={addForm}
            setForm={setAddForm}
            onClose={() => setIsAddOpen(false)}
            onSubmit={handleCreateManual}
            adding={adding}
          />
        )}
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Top Header & Search Bar */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy flex items-center gap-2">
            <ListChecks className="text-primary" /> Application Pipeline
          </h1>
          <p className="text-slate text-sm mt-0.5">
            Drag cards across stages. Click any card to get personalized AI interview & follow-up coaching.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate" size={16} />
            <input
              type="text"
              placeholder="Filter by role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate/20 focus:outline-none focus:border-primary w-44 sm:w-56 bg-white"
            />
          </div>

          <button
            onClick={handleSyncAllLinkedIn}
            disabled={syncingAll}
            className="px-3 py-2 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/15 text-[#0A66C2] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Sync live status and applicant counts from LinkedIn API"
          >
            <RefreshCw size={13} className={syncingAll ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync Live LinkedIn</span>
          </button>

          <Button onClick={() => setIsAddOpen(true)} className="!text-xs !py-2.5 shrink-0">
            <Plus size={15} /> Track Application
          </Button>
        </div>
      </motion.div>

      {/* Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {COLUMNS.map((col) => {
          const colApps = filteredApps.filter((a) => a.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col)}
              className="bg-slate/5 border border-slate/15 rounded-2xl p-3 w-72 flex-shrink-0 flex flex-col max-h-[calc(100vh-210px)]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-bold text-navy text-xs uppercase tracking-wider">{col}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate/15 text-slate">
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[100px]">
                {colApps.map((a) => (
                  <motion.div
                    key={a._id}
                    layout
                    draggable
                    onDragStart={() => setDragId(a._id)}
                    onClick={() => openAppDetails(a)}
                    className="bg-white rounded-xl p-3.5 border border-slate/15 shadow-xs hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:shadow-card group"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className="font-bold text-sm text-navy leading-snug line-clamp-2">{a.job?.title || 'Untitled Role'}</p>
                      <button
                        onClick={(e) => handleDelete(a._id, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate/60 hover:text-danger p-1 transition-opacity"
                        title="Delete application"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-xs text-slate font-medium flex items-center gap-1 mt-0.5">
                      <Building size={12} /> {a.job?.company || 'Unknown Company'}
                    </p>

                    {/* LinkedIn Live Indicator on Card */}
                    {(a.liveTracking || a.job?.source === 'linkedin') && (
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                          a.liveTracking?.isClosed
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${a.liveTracking?.isClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                          {a.liveTracking?.isClosed ? 'Closed' : 'Accepting Applications'}
                        </span>
                        {a.liveTracking?.applicantsCount && (
                          <span className="text-slate font-medium truncate max-w-[110px]">
                            {a.liveTracking.applicantsCount}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate/10 text-[11px] text-slate">
                      <span>{a.appliedDate ? new Date(a.appliedDate).toLocaleDateString() : '—'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-lightSky text-primary font-bold">
                        {a.matchScore != null ? `${a.matchScore}% Match` : 'Tracked'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Application Modal */}
      {isAddOpen && (
        <ManualAppModal
          form={addForm}
          setForm={setAddForm}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleCreateManual}
          adding={adding}
        />
      )}

      {/* AI Stage Guidance & App Details Drawer */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate/15 pb-4 mb-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Application Strategy</span>
                  <h3 className="font-extrabold text-navy text-lg leading-tight mt-0.5">{selectedApp.job?.title}</h3>
                  <p className="text-xs text-slate">{selectedApp.job?.company} · {selectedApp.job?.location || 'Remote'}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-lg text-slate hover:text-navy hover:bg-slate/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Selector */}
              <div className="mb-4 p-3 rounded-xl bg-slate/5 border border-slate/10">
                <label className="text-xs font-bold text-navy block mb-1.5 uppercase tracking-wider">Current Pipeline Stage</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {COLUMNS.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChangeFromDrawer(st)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                        selectedApp.status === st
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white border-slate/20 text-slate hover:border-primary/40'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live LinkedIn Intelligence Card in Drawer */}
              {(selectedApp.liveTracking || selectedApp.job?.source === 'linkedin') && (
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-[#0A66C2]/10 via-white to-transparent border border-[#0A66C2]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#0A66C2]">
                      <Linkedin size={15} /> Live LinkedIn Tracking
                    </span>
                    <button
                      onClick={() => handleSyncSingleLinkedIn(selectedApp._id)}
                      disabled={syncingSingle}
                      className="px-2.5 py-1 rounded-lg border border-[#0A66C2]/30 bg-white hover:bg-[#0A66C2]/10 text-[#0A66C2] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Fetch real-time updates from LinkedIn"
                    >
                      <RefreshCw size={11} className={syncingSingle ? 'animate-spin' : ''} /> Sync Now
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white border border-slate/15">
                      <span className="text-[10px] text-slate font-medium block">Posting Status</span>
                      <span className={`font-bold inline-flex items-center gap-1 mt-0.5 ${
                        selectedApp.liveTracking?.isClosed ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedApp.liveTracking?.isClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                        {selectedApp.liveTracking?.postingStatus || 'Active'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate/15">
                      <span className="text-[10px] text-slate font-medium block">Applicant Pool</span>
                      <span className="font-bold text-navy mt-0.5 block truncate">
                        {selectedApp.liveTracking?.applicantsCount || 'Active Candidate Pool'}
                      </span>
                    </div>
                  </div>

                  {selectedApp.job?.externalUrl && (
                    <a
                      href={selectedApp.job.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-semibold transition-colors"
                    >
                      <ExternalLink size={13} /> View Live Listing on LinkedIn
                    </a>
                  )}
                </div>
              )}

              {/* AI Guidance Content */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Sparkles size={16} /> AI Stage Coaching: {selectedApp.status} Stage
                </div>

                {guidanceLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate text-xs">
                    <Loader2 className="animate-spin text-primary mb-2" size={24} />
                    Synthesizing recruiter recommendations for {selectedApp.status} stage...
                  </div>
                ) : guidance ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-lightSky/40 border border-primary/20 text-xs text-navy leading-relaxed">
                      <strong className="block text-primary font-bold mb-1 uppercase tracking-wider">Stage Objective</strong>
                      {guidance.focus}
                    </div>

                    {guidance.checklist?.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-slate/15 space-y-2">
                        <strong className="block text-xs font-bold text-navy uppercase tracking-wider">Action Checklist</strong>
                        {guidance.checklist.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate">
                            <CheckCircle2 size={14} className="text-success mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {guidance.questionsToAsk?.length > 0 && (
                      <div className="p-4 rounded-xl bg-white border border-slate/15 space-y-2">
                        <strong className="block text-xs font-bold text-navy uppercase tracking-wider">Smart Questions to Ask Interviewer</strong>
                        {guidance.questionsToAsk.map((q, idx) => (
                          <div key={idx} className="text-xs text-navy bg-slate/5 p-2 rounded-lg leading-relaxed">
                            "{q}"
                          </div>
                        ))}
                      </div>
                    )}

                    {guidance.pitfalls && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                        <strong className="block font-bold mb-1 uppercase tracking-wider">Pitfall to Avoid</strong>
                        {guidance.pitfalls}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate">No specific guidance available.</p>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-slate/15 pt-4 mt-6 flex items-center justify-between">
                <button
                  onClick={(e) => handleDelete(selectedApp._id, e)}
                  className="text-xs font-semibold text-danger flex items-center gap-1 hover:underline"
                >
                  <Trash2 size={13} /> Remove Application
                </button>
                <Button onClick={() => navigate('/assessment')} className="!text-xs !py-2">
                  Practice Interview Questions <ChevronRight size={14} />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-component: Manual Application Modal
const ManualAppModal = ({ form, setForm, onClose, onSubmit, adding }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate/15"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-extrabold text-navy text-lg">Track External Application</h3>
          <p className="text-xs text-slate">Add any job you've applied to elsewhere to get AI stage coaching.</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate hover:text-navy">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Job Title *</label>
          <input
            required
            type="text"
            placeholder="e.g. Senior Frontend Engineer"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate/20 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Company Name *</label>
          <input
            required
            type="text"
            placeholder="e.g. Stripe, Airbnb, Google"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate/20 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-navy block mb-1">Work Mode</label>
            <select
              value={form.workMode}
              onChange={(e) => setForm({ ...form, workMode: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate/20 focus:outline-none focus:border-primary"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-navy block mb-1">Pipeline Stage</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate/20 focus:outline-none focus:border-primary"
            >
              {COLUMNS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Location (Optional)</label>
          <input
            type="text"
            placeholder="e.g. San Francisco, CA or Bengaluru"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate/20 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Notes / Referral Info (Optional)</label>
          <textarea
            rows={2}
            placeholder="Referred by John, contacted hiring manager on LinkedIn..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate/20 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate/10">
          <button type="button" onClick={onClose} className="btn-secondary !text-xs !py-2">
            Cancel
          </button>
          <Button type="submit" disabled={adding} className="!text-xs !py-2">
            {adding ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
            Add to Pipeline
          </Button>
        </div>
      </form>
    </motion.div>
  </div>
);

export default ApplicationsPage;

