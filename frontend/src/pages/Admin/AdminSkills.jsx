import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', difficulty: 'Intermediate' });
  const { showToast } = useApp();

  const load = () => adminService.getSkills().then((r) => setSkills(r.skills));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await adminService.createSkill(form);
    setModalOpen(false);
    setForm({ name: '', category: '', difficulty: 'Intermediate' });
    showToast('Skill added');
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    await adminService.deleteSkill(id);
    showToast('Skill deleted');
    load();
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Skill Management</h1>
          <p className="text-slate mt-1">{skills.length} skills in the taxonomy</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add Skill</Button>
      </motion.div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-xs uppercase text-slate border-b border-slate/10">
              <th className="pb-3 font-semibold">Name</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold">Difficulty</th>
              <th className="pb-3 font-semibold">Prerequisites</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s._id} className="border-b border-slate/5 last:border-0">
                <td className="py-3 font-semibold text-navy">{s.name}</td>
                <td className="py-3 text-slate">{s.category}</td>
                <td className="py-3 text-slate">{s.difficulty}</td>
                <td className="py-3 text-slate">{s.prerequisites?.join(', ') || '—'}</td>
                <td className="py-3 text-right">
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 text-slate hover:text-danger"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Skill">
        <div className="space-y-3">
          <input className="input-field" placeholder="Skill name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <select className="input-field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
          <Button onClick={handleCreate} className="w-full">Add Skill</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSkills;
