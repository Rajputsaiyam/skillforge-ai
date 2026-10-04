import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import adminService from '../../services/adminService';
import ActivityTimeline from '../../components/admin/ActivityTimeline';

const AdminActivity = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { adminService.getActivityLog().then((r) => setLogs(r.logs)); }, []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy">Activity Log</h1>
        <p className="text-slate mt-1">Real-time platform activity across all users.</p>
      </motion.div>
      <ActivityTimeline logs={logs} />
    </div>
  );
};

export default AdminActivity;
