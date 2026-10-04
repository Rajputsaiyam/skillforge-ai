import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { Eye, Ban, CheckCircle2, Trash2 } from 'lucide-react';

const UsersTable = ({ users, onSuspend, onActivate, onDelete }) => (
  <div className="card overflow-x-auto">
    <table className="w-full text-sm min-w-[800px]">
      <thead>
        <tr className="text-left text-xs uppercase text-slate border-b border-slate/10">
          <th className="pb-3 font-semibold">Name</th>
          <th className="pb-3 font-semibold">Target Role</th>
          <th className="pb-3 font-semibold">Resume</th>
          <th className="pb-3 font-semibold">Applications</th>
          <th className="pb-3 font-semibold">Status</th>
          <th className="pb-3 font-semibold text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u._id} className="border-b border-slate/5 last:border-0">
            <td className="py-3">
              <p className="font-semibold text-navy">{u.fullName}</p>
              <p className="text-xs text-slate">{u.email}</p>
            </td>
            <td className="py-3 text-slate">{u.targetRole || '—'}</td>
            <td className="py-3 text-slate">{u.resumeStatus}</td>
            <td className="py-3 text-slate">{u.applicationsCount}</td>
            <td className="py-3">
              <Badge variant={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge>
            </td>
            <td className="py-3">
              <div className="flex items-center justify-end gap-2">
                <Link to={`/admin/users/${u._id}`} className="p-1.5 text-slate hover:text-primary"><Eye size={16} /></Link>
                {u.status === 'active' ? (
                  <button onClick={() => onSuspend(u._id)} className="p-1.5 text-slate hover:text-warning"><Ban size={16} /></button>
                ) : (
                  <button onClick={() => onActivate(u._id)} className="p-1.5 text-slate hover:text-success"><CheckCircle2 size={16} /></button>
                )}
                <button onClick={() => onDelete(u._id)} className="p-1.5 text-slate hover:text-danger"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default UsersTable;
