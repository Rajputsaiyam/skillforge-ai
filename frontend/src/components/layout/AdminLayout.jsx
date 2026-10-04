import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Topbar from './Topbar';

const AdminLayout = () => (
  <div className="flex min-h-screen bg-veryLightBlue/40">
    <AdminSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar />
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AdminLayout;
