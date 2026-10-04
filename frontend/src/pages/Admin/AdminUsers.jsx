import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import adminService from '../../services/adminService';
import UsersTable from '../../components/admin/UsersTable';
import { useApp } from '../../context/AppContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { showToast } = useApp();

  const load = () => adminService.getUsers().then((r) => setUsers(r.users));
  useEffect(() => { load(); }, []);

  const handleSuspend = async (id) => { await adminService.suspendUser(id); showToast('User suspended'); load(); };
  const handleActivate = async (id) => { await adminService.activateUser(id); showToast('User activated'); load(); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    await adminService.deleteUser(id); showToast('User deleted'); load();
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy">User Management</h1>
        <p className="text-slate mt-1">{users.length} registered users</p>
      </motion.div>
      <UsersTable users={users} onSuspend={handleSuspend} onActivate={handleActivate} onDelete={handleDelete} />
    </div>
  );
};

export default AdminUsers;
