import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import adminService from '../../services/adminService';
import LineChartCard from '../../components/charts/LineChartCard';
import BarChartCard from '../../components/charts/BarChartCard';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { adminService.getDashboardStats().then(setStats); }, []);
  if (!stats) return <p className="text-slate">Loading...</p>;

  const summaryBars = [
    { name: 'Users', value: stats.totalUsers },
    { name: 'Resumes', value: stats.resumesParsed },
    { name: 'Assessments', value: stats.assessmentsCompleted },
    { name: 'Applications', value: stats.applicationsTracked },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy">Platform Analytics</h1>
      </motion.div>
      <div className="grid lg:grid-cols-2 gap-6">
        <LineChartCard title="User Growth" data={stats.userGrowth} dataKey="count" xKey="date" />
        <BarChartCard title="Platform Activity Summary" data={summaryBars} dataKey="value" xKey="name" />
      </div>
    </div>
  );
};

export default AdminAnalytics;
