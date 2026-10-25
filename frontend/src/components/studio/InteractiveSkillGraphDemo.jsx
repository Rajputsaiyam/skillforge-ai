import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, ShieldCheck, Zap, Layers, Sparkles, Check, ArrowRight } from 'lucide-react';
import StudioTiltCard from './StudioTiltCard';

const NODES = [
  { id: 'ts', label: 'TypeScript', level: 92, verified: true, category: 'Core', deps: ['React 18 & Next.js', 'PostgreSQL & Redis'] },
  { id: 'react', label: 'React 18 & Next.js', level: 95, verified: true, category: 'Frontend', deps: ['TypeScript', 'Distributed Systems'] },
  { id: 'sys', label: 'Distributed Systems', level: 84, verified: true, category: 'Architecture', deps: ['Kubernetes & Docker', 'PostgreSQL & Redis'] },
  { id: 'sql', label: 'PostgreSQL & Redis', level: 88, verified: true, category: 'Database', deps: ['TypeScript', 'Distributed Systems'] },
  { id: 'k8s', label: 'Kubernetes & Docker', level: 72, verified: false, category: 'Infrastructure', deps: ['Distributed Systems'] },
  { id: 'ai', label: 'LLM Agents & RAG', level: 86, verified: true, category: 'AI Intelligence', deps: ['TypeScript', 'Distributed Systems'] },
];

const InteractiveSkillGraphDemo = () => {
  const [selectedNode, setSelectedNode] = useState(NODES[0]);

  return (
    <StudioTiltCard
      maxTilt={4}
      className="group relative rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(2,132,199,0.18)]"
    >
      <div className="flex items-center justify-between border-b border-sky-100 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary border border-sky-200">
            <GitBranch size={13} /> Skill Breakdown Matrix
          </span>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-navy">
            Target Role Skill Overview
          </h3>
          <p className="text-xs text-slate mt-0.5">
            Click any skill to view its readiness level and related technologies
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">
          <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
          LIVE PREVIEW
        </span>
      </div>

      {/* Interactive Node Matrix Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {NODES.map((node) => {
          const isSelected = selectedNode.id === node.id;
          const isRelated = selectedNode.deps.includes(node.label);

          return (
            <motion.button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-sky-50/70 shadow-[0_4px_20px_rgba(2,132,199,0.2)] ring-2 ring-primary/25'
                  : isRelated
                  ? 'border-sky-300 bg-sky-50/30'
                  : 'border-slate-100 bg-[#fbfdff] hover:border-sky-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate/70">
                  {node.category}
                </span>
                {node.verified ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={11} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-200">
                    GAP
                  </span>
                )}
              </div>

              <div className="mt-3">
                <div className="text-xs font-bold text-navy truncate">{node.label}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate">Readiness</span>
                  <span className="text-xs font-black font-mono text-primary">{node.level}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={false}
                    animate={{ width: `${node.level}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {isRelated && !isSelected && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-sky-500 text-white text-[9px] font-mono px-1.5 py-0.2 shadow-xs">
                  LINK
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Node Details Drawer */}
      <div className="mt-6 rounded-2xl border border-sky-100 bg-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-navy">{selectedNode.label}</h4>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-primary">
                {selectedNode.category}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate">
              Mapped directly to your practice questions and 30-day learning plan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate">Related Skills:</span>
            <div className="flex flex-wrap gap-1">
              {selectedNode.deps.map((dep) => (
                <span
                  key={dep}
                  className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-mono font-medium text-navy"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudioTiltCard>
  );
};

export default InteractiveSkillGraphDemo;
