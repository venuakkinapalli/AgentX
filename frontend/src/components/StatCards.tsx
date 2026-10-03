import React from 'react';
import { Users, Building, Layers, DoorClosed } from 'lucide-react';
import { Student } from '../types/student';

interface StatCardsProps {
  students: Student[];
}

export const StatCards: React.FC<StatCardsProps> = ({ students }) => {
  const totalStudents = students.length;
  
  // Calculate unique hostels, blocks, and rooms
  const uniqueHostels = new Set(students.map((s) => s.hostel_name.trim().toLowerCase())).size;
  const uniqueBlocks = new Set(
    students.map((s) => `${s.hostel_name}_${s.block_number}`.toLowerCase())
  ).size;
  const uniqueRooms = new Set(
    students.map((s) => `${s.hostel_name}_${s.block_number}_${s.room_number}`.toLowerCase())
  ).size;

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      description: 'Active hostel residents',
      icon: Users,
      gradient: 'from-blue-600/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Hostels In Use',
      value: uniqueHostels,
      description: 'Covered residence buildings',
      icon: Building,
      gradient: 'from-indigo-600/20 to-indigo-500/5',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
    {
      title: 'Occupied Blocks',
      value: uniqueBlocks,
      description: 'Active residential wings',
      icon: Layers,
      gradient: 'from-emerald-600/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Allocated Rooms',
      value: uniqueRooms,
      description: 'Assigned student rooms',
      icon: DoorClosed,
      gradient: 'from-purple-600/20 to-purple-500/5',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-xl bg-gradient-to-br ${stat.gradient} bg-slate-900/60 border ${stat.borderColor} backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`p-2 rounded-lg bg-slate-800/80 ${stat.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {stat.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
          </div>
        );
      })}
    </div>
  );
};
