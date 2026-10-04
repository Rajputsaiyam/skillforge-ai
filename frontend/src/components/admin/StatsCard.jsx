import React from 'react';
import Card from '../ui/Card';

const StatsCard = ({ label, value, icon: Icon, delay = 0 }) => (
  <Card delay={delay} className="flex items-center justify-between">
    <div>
      <p className="text-xs text-slate uppercase font-semibold tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold text-navy mt-1">{value}</p>
    </div>
    {Icon && (
      <div className="w-11 h-11 rounded-xl bg-lightSky flex items-center justify-center">
        <Icon size={20} className="text-primary" />
      </div>
    )}
  </Card>
);

export default StatsCard;
