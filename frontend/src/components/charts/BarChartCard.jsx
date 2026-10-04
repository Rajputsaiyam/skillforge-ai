import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card from '../ui/Card';

const BarChartCard = ({ title, data, dataKey = 'value', xKey = 'name', color = '#38BDF8' }) => (
  <Card>
    <h4 className="font-bold text-navy mb-4">{title}</h4>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#475569' }} />
        <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E0F2FE', fontSize: 12 }} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

export default BarChartCard;
