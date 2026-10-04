import React, { useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

const STATE_COLORS = {
  Strong: { bg: '#10B981', ring: '#10B98133' },
  Current: { bg: '#2563EB', ring: '#2563EB33' },
  'Needs Improvement': { bg: '#F59E0B', ring: '#F59E0B33' },
  Missing: { bg: '#EF4444', ring: '#EF444433' },
  Recommended: { bg: '#8B5CF6', ring: '#8B5CF633' },
};

const SkillNode = ({ data }) => {
  const color = STATE_COLORS[data.state] || STATE_COLORS.Current;
  return (
    <div
      className="px-3 py-2 rounded-xl text-white text-xs font-semibold shadow-md cursor-pointer min-w-[110px] text-center"
      style={{ background: color.bg, boxShadow: `0 0 0 6px ${color.ring}` }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {data.name}
      <div className="text-[10px] font-normal opacity-90">{data.level}%</div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes = { skillNode: SkillNode };

// Simple layered layout: group by category into columns, stack vertically within category
function layoutNodes(nodes) {
  const categories = [...new Set(nodes.map((n) => n.category))];
  const colWidth = 220;
  const rowHeight = 90;
  const positioned = {};
  categories.forEach((cat, colIdx) => {
    const inCat = nodes.filter((n) => n.category === cat);
    inCat.forEach((n, rowIdx) => {
      positioned[n.id] = { x: colIdx * colWidth, y: rowIdx * rowHeight };
    });
  });
  return positioned;
}

const SkillGraphCanvas = ({ graph, onNodeClick }) => {
  const positions = useMemo(() => layoutNodes(graph.nodes), [graph.nodes]);

  const rfNodes = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: 'skillNode',
        position: positions[n.id] || { x: 0, y: 0 },
        data: n,
      })),
    [graph.nodes, positions]
  );

  const rfEdges = useMemo(
    () =>
      graph.edges
        .filter((e) => e.type === 'prerequisite')
        .map((e, i) => ({
          id: `e-${i}`,
          source: e.source,
          target: e.target,
          animated: false,
          style: { stroke: '#CBD5E1' },
        })),
    [graph.edges]
  );

  const handleNodeClick = useCallback(
    (_, node) => onNodeClick && onNodeClick(node.data),
    [onNodeClick]
  );

  return (
    <div style={{ height: '560px' }} className="rounded-2xl border border-slate/10 bg-white overflow-hidden">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#E0F2FE" gap={20} />
        <Controls />
        <MiniMap pannable zoomable nodeColor={(n) => STATE_COLORS[n.data.state]?.bg || '#2563EB'} />
      </ReactFlow>
    </div>
  );
};

export default SkillGraphCanvas;
