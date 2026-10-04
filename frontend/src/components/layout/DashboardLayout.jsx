import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import ChatbotWidget from '../chat/ChatbotWidget';

const DashboardLayout = () => (
  <div className="flex min-h-screen bg-veryLightBlue/40">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>
      <MobileNav />
    </div>
    <ChatbotWidget />
  </div>
);

export default DashboardLayout;
