import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  useEffect(() => { adminService.getAllJobs().then((r) => setJobs(r.jobs)); }, []);

  return (
    <div>
       <div className="mb-6">
         <h1 className="text-2xl font-bold text-navy">Job Monitoring</h1>
         <p className="text-slate mt-1">{jobs.length} jobs across all sources</p>
       </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="text-left text-xs uppercase text-slate border-b border-slate/10">
              <th className="pb-3 font-semibold">Title</th>
              <th className="pb-3 font-semibold">Company</th>
              <th className="pb-3 font-semibold">Source</th>
              <th className="pb-3 font-semibold">Views</th>
              <th className="pb-3 font-semibold">Applications</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j._id} className="border-b border-slate/5 last:border-0">
                <td className="py-3 font-semibold text-navy">{j.title}</td>
                <td className="py-3 text-slate">{j.company}</td>
                <td className="py-3"><Badge variant="primary">{j.source}</Badge></td>
                <td className="py-3 text-slate">{j.views}</td>
                <td className="py-3 text-slate">{j.applicationsCount}</td>
                <td className="py-3"><Badge variant={j.status === 'active' ? 'success' : 'neutral'}>{j.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AdminJobs;
