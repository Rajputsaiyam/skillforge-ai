import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import ActivityTimeline from '../../components/admin/ActivityTimeline';

const AdminActivity = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { adminService.getActivityLog().then((r) => setLogs(r.logs)); }, []);

  return (
    <div>
       <div className="mb-6">
         <h1 className="text-2xl font-bold text-navy">Activity Log</h1>
         <p className="text-slate mt-1">Real-time platform activity across all users.</p>
       </div>
      <ActivityTimeline logs={logs} />
    </div>
  );
};

export default AdminActivity;
