import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import adminService from '../../services/adminService';

const AdminUserDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => { adminService.getUserDetail(id).then(setData); }, [id]);

  if (!data) return <p className="text-slate">Loading...</p>;
  const { user, resume, skills, assessments, applications } = data;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy mb-1">{user.fullName}</h1>
      <p className="text-slate mb-6">{user.email} · Target role: {user.targetRole || '—'}</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-navy mb-3">Skills</h3>
          <div className="space-y-3">{skills.map((s) => <ProgressBar key={s._id} value={s.level} label={s.skillName} />)}</div>
        </Card>
        <Card>
          <h3 className="font-bold text-navy mb-3">Resume</h3>
          {resume ? (
            <p className="text-sm text-slate">Score: <span className="font-bold text-navy">{resume.resumeScore}/100</span> · {resume.stats.skillsDetected} skills detected</p>
          ) : (
            <p className="text-sm text-slate">No resume uploaded.</p>
          )}
        </Card>
        <Card>
          <h3 className="font-bold text-navy mb-3">Assessments ({assessments.length})</h3>
          {assessments.map((a) => (
            <p key={a._id} className="text-sm text-slate">{a.skillsAssessed.join(', ')} — {a.status}</p>
          ))}
        </Card>
        <Card>
          <h3 className="font-bold text-navy mb-3">Applications ({applications.length})</h3>
          {applications.map((a) => (
            <p key={a._id} className="text-sm text-slate">{a.job?.title} — {a.status}</p>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default AdminUserDetail;
