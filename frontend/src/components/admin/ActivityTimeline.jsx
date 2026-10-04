import React from 'react';

const ActivityTimeline = ({ logs }) => (
  <div className="card">
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log._id} className="flex gap-3 border-b border-slate/5 last:border-0 pb-4 last:pb-0">
          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-navy">{log.description}</p>
            <p className="text-xs text-slate mt-0.5">
              {log.user?.fullName ? `${log.user.fullName} · ` : ''}
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ActivityTimeline;
