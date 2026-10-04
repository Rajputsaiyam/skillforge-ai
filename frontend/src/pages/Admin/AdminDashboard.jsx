import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, FileText, ClipboardCheck, Eye, ListChecks } from 'lucide-react';
import adminService from '../../services/adminService';
import StatsCard from '../../components/admin/StatsCard';
import LineChartCard from '../../components/charts/LineChartCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => { adminService.getDashboardStats().then(setStats); }, []);

  if (!stats) return <p className="text-slate">Loading...</p>;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy">Admin Dashboard</h1>
        <p className="text-slate mt-1">Platform-wide analytics and monitoring.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatsCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <StatsCard label="Active Users" value={stats.activeUsers} icon={UserCheck} delay={0.05} />
        <StatsCard label="Resumes Parsed" value={stats.resumesParsed} icon={FileText} delay={0.1} />
        <StatsCard label="Assessments Completed" value={stats.assessmentsCompleted} icon={ClipboardCheck} delay={0.15} />
        <StatsCard label="Jobs Viewed" value={stats.jobsViewed} icon={Eye} delay={0.2} />
        <StatsCard label="Applications Tracked" value={stats.applicationsTracked} icon={ListChecks} delay={0.25} />
      </div>

      <LineChartCard title="User Growth (last 14 days)" data={stats.userGrowth} dataKey="count" xKey="date" />
    </div>
  );
};

export default AdminDashboard;
