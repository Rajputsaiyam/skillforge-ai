import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Layers, Sparkles } from 'lucide-react';
import SkillGraphCanvas from '../../components/skill/SkillGraphCanvas';
import SkillNodeDetail from '../../components/skill/SkillNodeDetail';
import skillService from '../../services/skillService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';

const LEGEND = [
  { label: 'Strong', color: '#10B981' },
  { label: 'Current', color: '#2563EB' },
  { label: 'Needs Improvement', color: '#F59E0B' },
  { label: 'Missing', color: '#EF4444' },
  { label: 'Recommended', color: '#8B5CF6' },
];

const SkillGraphPage = () => {
  const { user } = useAuth();
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selected, setSelected] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    skillService
      .getSkillGraph(user?.targetRole)
      .then(setGraph)
      .finally(() => setLoading(false));
  }, [user]);

  const categories = useMemo(() => {
    const set = new Set(graph.nodes.map((n) => n.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [graph.nodes]);

  const states = ['All', 'Strong', 'Current', 'Needs Improvement', 'Missing', 'Recommended'];

  const filteredGraph = useMemo(() => {
    let filteredNodes = graph.nodes;
    if (categoryFilter !== 'All') {
      filteredNodes = filteredNodes.filter((n) => n.category === categoryFilter);
    }
    if (stateFilter !== 'All') {
      filteredNodes = filteredNodes.filter((n) => n.state === stateFilter);
    }
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = graph.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    return { nodes: filteredNodes, edges: filteredEdges };
  }, [graph, categoryFilter, stateFilter]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Interactive Skill Graph</h1>
          <p className="text-slate mt-1 text-sm">
            Topological career map aligned to your target role: <strong className="text-navy">{user?.targetRole || 'Software Engineer'}</strong>.
            Click any skill to review prerequisites, generate instant micro-lessons, or take an AI assessment.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs text-slate font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} /> {l.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate/15 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="flex items-center gap-1 text-slate font-semibold mr-1">
            <Layers size={14} className="text-primary" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-veryLightBlue text-slate hover:text-navy hover:bg-lightSky'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate font-semibold mr-1">
            <Filter size={14} className="text-primary" /> State:
          </span>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs bg-veryLightBlue px-2.5 py-1 rounded-lg border border-slate/20 focus:outline-none focus:border-primary text-navy font-semibold"
          >
            {states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Graph & Detail Split View */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <Card className="h-[560px] flex items-center justify-center text-slate">Loading skill graph...</Card>
          ) : (
            <SkillGraphCanvas graph={filteredGraph} onNodeClick={setSelected} />
          )}
        </div>
        <div>
          {selected ? (
            <SkillNodeDetail skill={selected} onClose={() => setSelected(null)} />
          ) : (
            <Card className="text-center text-slate text-sm py-16 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-lightSky text-primary flex items-center justify-center mb-3">
                <Sparkles size={22} />
              </div>
              <p className="font-bold text-navy text-base mb-1">Select a skill node</p>
              <p className="max-w-xs text-xs text-slate">
                Click any node in the graph to inspect proficiency levels, prerequisites, generate AI lessons, or start a targeted quiz.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGraphPage;
