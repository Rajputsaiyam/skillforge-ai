import React from 'react';
import Card from '../../components/ui/Card';

const AdminSettings = () => (
  <div className="max-w-2xl">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-navy">Admin Settings</h1>
    </div>
    <Card>
      <h3 className="font-bold text-navy mb-2">Platform Configuration</h3>
      <p className="text-sm text-slate">Job provider, OAuth and ML-service configuration are managed via backend environment variables (see backend/.env.example).</p>
    </Card>
  </div>
);

export default AdminSettings;
