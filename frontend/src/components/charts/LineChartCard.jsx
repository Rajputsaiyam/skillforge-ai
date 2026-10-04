import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card from '../ui/Card';

const LineChartCard = ({ title, data, dataKey = 'value', xKey = 'date', color = '#2563EB' }) => (
  <Card>
    <h4 className="font-bold text-navy mb-4">{title}</h4>
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#475569' }} />
        <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E0F2FE', fontSize: 12 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

export default LineChartCard;
