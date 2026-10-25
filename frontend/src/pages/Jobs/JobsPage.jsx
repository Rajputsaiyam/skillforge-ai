import React, { useEffect, useState } from 'react';
import { Briefcase, Linkedin, ExternalLink, RefreshCw, Radio, CheckCircle, Sparkles, Zap } from 'lucide-react';
import JobFilters from '../../components/jobs/JobFilters';
import JobCard from '../../components/jobs/JobCard';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import JobAutomationModal from '../../components/jobs/JobAutomationModal';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import { useApp } from '../../context/AppContext';

const JobsPage = () => {
  const [filters, setFilters] = useState({ keyword: '', location: '', workMode: '', workTime: '' });
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [linkedInLinks, setLinkedInLinks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const { showToast, user } = useApp();

  const fetchJobs = async (customFilters = null) => {
    setLoading(true);
    const activeFilters = customFilters || filters;
    try {
      const res = await jobService.searchJobs(activeFilters);
      setJobs(res.jobs || []);
      setConnected(res.integrationConnected ?? true);
      if (res.locationContext && !detectedLocation) {
        setDetectedLocation(res.locationContext);
      }
    } catch (err) {
      console.error(err);
      showToast('Could not fetch live jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingApplications = async () => {
    try {
      const res = await applicationService.getMyApplications();
      const apps = res.applications || [];
      const saved = new Set();
      const applied = new Set();
      apps.forEach((a) => {
        if (a.job?._id) {
          saved.add(a.job._id);
          if (a.status !== 'Saved') {
            applied.add(a.job._id);
          }
        }
      });
      setSavedIds(saved);
      setAppliedIds(applied);
    } catch (err) {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchExistingApplications();

    // Auto-detect user IP location and pre-populate search filters
    jobService
      .detectLocation()
      .then((res) => {
        if (res?.locationContext) {
          setDetectedLocation(res.locationContext);
          const localizedCountry = res.locationContext.country || 'India';
          setFilters((prev) => {
            const nextFilters = { ...prev, location: localizedCountry };
            fetchJobs(nextFilters);
            return nextFilters;
          });
        } else {
          fetchJobs();
        }
      })
      .catch(() => {
        fetchJobs();
      });

    jobService
      .getLinkedInLinks({ location: filters.location, workMode: filters.workMode })
      .then((r) => setLinkedInLinks(r.links))
      .catch(() => {});
  }, []); // eslint-disable-line

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
    showToast('Refreshed live jobs from LinkedIn!');
  };

  const handleSave = async (job) => {
    try {
      await applicationService.saveJob(job._id, job.match?.overallMatchPct, 'Saved');
      setSavedIds((prev) => new Set(prev).add(job._id));
      showToast('Job saved in your pipeline');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not save job', 'error');
    }
  };

  const handleApply = async (job) => {
    try {
      await applicationService.applyAndTrackJob(job._id, job.match?.overallMatchPct);
      setSavedIds((prev) => new Set(prev).add(job._id));
      setAppliedIds((prev) => new Set(prev).add(job._id));
      showToast('Tracked as Applied! Opening live LinkedIn posting...');
      const targetUrl = job.linkedInApplyUrl || job.externalUrl;
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not track application', 'error');
    }
  };

  return (
    <div className="pb-12">
      {/* Page Title & Live Connection Status */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Live LinkedIn Job Search</h1>
          <p className="text-slate mt-1">Real-time jobs matched to your target role & skills, with live application tracking.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAutomation(true)}
            className="btn-secondary !px-3.5 !py-2 text-xs"
            title="Auto-search, AI pitch generation & 1-click batch application"
          >
            <Zap size={14} className="text-primary" />
            <span>Job Auto-Apply Bot</span>
            <span className="text-[10px] uppercase tracking-wider text-slate">Free</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-success">
            <Linkedin size={13} /> LinkedIn connection active
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-2 rounded-xl border border-slate/20 hover:border-slate/40 text-slate hover:text-navy transition-colors bg-white shadow-2xs"
            title="Refresh live LinkedIn postings"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* IP Geolocation Context Banner */}
      {detectedLocation && (
         <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-slate/20 bg-white px-4 py-2.5 text-xs text-navy">
          <div className="flex items-center gap-2">
             <span className="h-2 w-2 rounded-full bg-success"></span>
            <span className="font-semibold text-primary">IP Geolocation Detected:</span>
            <span className="text-navy font-bold">
              {detectedLocation.city ? `${detectedLocation.city}, ` : ''}{detectedLocation.country}
            </span>
             <span className="text-slate hidden sm:inline">Auto-localizing verified jobs and internships for your region</span>
          </div>

          <div className="flex items-center gap-2">
            {filters.location !== 'Remote' ? (
              <button
                onClick={() => {
                  const next = { ...filters, location: 'Remote' };
                  setFilters(next);
                  fetchJobs(next);
                }}
                className="text-primary hover:underline font-semibold text-[11px]"
              >
                Switch to Worldwide Remote
              </button>
            ) : (
              <button
                onClick={() => {
                  const next = { ...filters, location: detectedLocation.country || 'India' };
                  setFilters(next);
                  fetchJobs(next);
                }}
                className="text-primary hover:underline font-semibold text-[11px]"
              >
                Switch to Local ({detectedLocation.country || 'India'})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Target Role Guidance Pill */}
      {user?.targetRole && (
         <div className="mb-5 flex items-center justify-between gap-3 border border-slate/20 bg-white px-4 py-2.5 text-xs text-navy">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles size={14} className="text-primary" />
            Showing real opportunities automatically tailored for your target role: <strong className="font-bold text-primary">{user.targetRole}</strong>
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate font-medium">Live sync active</span>
        </div>
      )}

      {/* LinkedIn Search Direct Links */}
      {linkedInLinks.length > 0 && (
         <div className="mb-5 flex flex-wrap items-center gap-2.5 border border-slate/20 bg-white p-3.5">
           <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Linkedin size={15} /> Quick LinkedIn searches:
          </span>
          {linkedInLinks.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noreferrer"
               className="flex items-center gap-1 rounded-md border border-slate/20 bg-white px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-veryLightBlue"
            >
              {l.label} <ExternalLink size={11} />
            </a>
          ))}
        </div>
      )}

      <JobFilters
        filters={filters}
        setFilters={setFilters}
        onSearch={fetchJobs}
        detectedLocation={detectedLocation}
      />

      {!connected ? (
        <EmptyState
          icon={Briefcase}
          title="Job provider integration not connected"
          description="Connecting to live LinkedIn API..."
        />
      ) : loading ? (
        <div className="grid md:grid-cols-2 gap-5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No live jobs found for this search"
          description="Try broadening your search keywords or switching locations."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {jobs.map((job, i) => (
            <JobCard
              key={job._id || job.externalJobId || i}
              job={job}
              onSave={handleSave}
              onApply={handleApply}
              saved={savedIds.has(job._id)}
              applied={appliedIds.has(job._id)}
              delay={i * 0.04}
            />
          ))}
        </div>
      )}

      {/* 100% Free Job Automation & Auto-Apply Bot Modal */}
      {showAutomation && (
        <JobAutomationModal
          onClose={() => setShowAutomation(false)}
          onAppliedUpdated={fetchExistingApplications}
        />
      )}
    </div>
  );
};

export default JobsPage;
