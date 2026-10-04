import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Copy, Check, Loader2, MessageSquare, Linkedin,
  FileText, Tag, User, MapPin, Briefcase, ExternalLink
} from 'lucide-react';
import profileService from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const TARGET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Machine Learning Engineer',
  'Cloud Architect',
];

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const { showToast } = useApp();

  // AI Pitch Studio state
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchData, setPitchData] = useState(null);
  const [pitchRole, setPitchRole] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    profileService.getProfile().then((r) => {
      setProfile(r.user);
      setForm(r.user);
      setPitchRole(r.user?.targetRole || 'Full Stack Developer');
    });
  }, []);

  const handleSave = async () => {
    const { user: updated } = await profileService.updateProfile(form);
    setProfile(updated);
    setUser(updated);
    localStorage.setItem('sg_user', JSON.stringify(updated));
    setEditing(false);
    showToast('Profile updated successfully');
  };

  const handleGeneratePitch = async () => {
    setPitchLoading(true);
    try {
      const res = await profileService.generatePitch(pitchRole || form.targetRole);
      setPitchData(res.pitch);
      showToast('AI Elevator Pitch & Bio generated!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not generate pitch', 'error');
    } finally {
      setPitchLoading(false);
    }
  };

  const copyText = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast('Copied to clipboard!');
  };

  if (!profile) return <p className="text-slate text-center py-20">Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Profile & Personal Brand</h1>
          <p className="text-slate text-sm mt-0.5">Manage your career identity and generate AI professional pitches.</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setForm(profile); }} className="btn-secondary">Cancel</button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </motion.div>

      {/* User Header Card */}
      <Card className="mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-20 h-20 rounded-full bg-blue-gradient flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md">
          {profile.fullName?.charAt(0)}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="font-extrabold text-navy text-xl">{profile.fullName}</h2>
          <p className="text-slate text-sm">{profile.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate mt-2">
            <span className="flex items-center gap-1 font-medium text-navy">
              <Briefcase size={13} className="text-primary" /> {profile.targetRole || 'Role not set'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {profile.location || 'Location not set'}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-full bg-lightSky text-primary font-semibold">
              {profile.skills?.length || 0} Assessed Skills
            </span>
          </div>
        </div>
      </Card>

      {/* Career Details Card */}
      <Card className="mb-6">
        <h3 className="font-bold text-navy mb-4 text-base">Career Focus</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate font-medium">Target Role</label>
            {editing ? (
              <select
                className="input-field mt-1"
                value={form.targetRole || ''}
                onChange={(e) => {
                  setForm({ ...form, targetRole: e.target.value });
                  setPitchRole(e.target.value);
                }}
              >
                <option value="">Select a role</option>
                {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <p className="text-navy font-semibold mt-1">{profile.targetRole || '—'}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-slate font-medium">Preferred Location</label>
            {editing ? (
              <input
                className="input-field mt-1"
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. San Francisco / Remote"
              />
            ) : (
              <p className="text-navy font-semibold mt-1">{profile.location || '—'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Social & Portfolio Links Card */}
      <Card className="mb-6">
        <h3 className="font-bold text-navy mb-4 text-base">Social Profiles & Portfolios</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {['linkedin', 'github', 'portfolio'].map((key) => (
            <div key={key}>
              <label className="text-xs text-slate font-medium capitalize">{key}</label>
              {editing ? (
                <input
                  className="input-field mt-1"
                  value={form.socialLinks?.[key] || ''}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: e.target.value } })}
                  placeholder={`https://${key}.com/...`}
                />
              ) : (
                <p className="text-navy font-medium mt-1 truncate">
                  {profile.socialLinks?.[key] ? (
                    <a
                      href={profile.socialLinks[key]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {profile.socialLinks[key].replace(/^https?:\/\//, '')} <ExternalLink size={11} />
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* AI Bio & Elevator Pitch Studio */}
      <Card className="border-primary/30 bg-gradient-to-br from-white via-lightSky/10 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            <h3 className="font-bold text-navy text-base">AI Elevator Pitch & Bio Studio</h3>
          </div>
          <Button
            onClick={handleGeneratePitch}
            disabled={pitchLoading}
            className="!text-xs !py-2 shrink-0"
          >
            {pitchLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {pitchData ? 'Regenerate Pitch' : 'Generate AI Bio & Pitches'}
          </Button>
        </div>

        <p className="text-xs text-slate mb-4 leading-relaxed">
          Create tailored 30-second interview pitches, LinkedIn "About" bios, and ATS headlines synthesized from your verified skills and target role.
        </p>

        {pitchData && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-3 border-t border-slate/15"
          >
            {/* 30-second elevator pitch */}
            <div className="p-4 rounded-xl bg-white border border-slate/15 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={14} /> 30-Second Interview Elevator Pitch
                </span>
                <button
                  onClick={() => copyText('pitch', pitchData.elevatorPitch)}
                  className="text-xs font-semibold text-slate hover:text-primary flex items-center gap-1"
                >
                  {copiedKey === 'pitch' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  <span>{copiedKey === 'pitch' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-navy leading-relaxed bg-slate/5 p-3 rounded-lg font-sans">
                "{pitchData.elevatorPitch}"
              </p>
              <p className="text-[11px] text-slate/80 mt-1.5">
                Use when interviewers say: <em>"Walk me through your background and what you're looking for next."</em>
              </p>
            </div>

            {/* LinkedIn About Summary */}
            <div className="p-4 rounded-xl bg-white border border-slate/15 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0A66C2] uppercase tracking-wider flex items-center gap-1.5">
                  <Linkedin size={14} /> LinkedIn "About" Summary
                </span>
                <button
                  onClick={() => copyText('linkedin', pitchData.linkedInAbout)}
                  className="text-xs font-semibold text-slate hover:text-primary flex items-center gap-1"
                >
                  {copiedKey === 'linkedin' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  <span>{copiedKey === 'linkedin' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-navy leading-relaxed whitespace-pre-wrap bg-slate/5 p-3 rounded-lg font-sans">
                {pitchData.linkedInAbout}
              </p>
            </div>

            {/* Resume Headline */}
            <div className="p-4 rounded-xl bg-white border border-slate/15 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} /> High-Impact Resume Headline
                </span>
                <button
                  onClick={() => copyText('headline', pitchData.resumeHeadline)}
                  className="text-xs font-semibold text-slate hover:text-primary flex items-center gap-1"
                >
                  {copiedKey === 'headline' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  <span>{copiedKey === 'headline' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs font-semibold text-navy bg-slate/5 p-2.5 rounded-lg">
                {pitchData.resumeHeadline}
              </p>
            </div>

            {/* Suggested Skill Tags */}
            {pitchData.suggestedTags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate flex items-center gap-1 mr-1">
                  <Tag size={12} /> Suggested Tags:
                </span>
                {pitchData.suggestedTags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-lightSky text-primary text-xs font-medium border border-primary/20">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;

