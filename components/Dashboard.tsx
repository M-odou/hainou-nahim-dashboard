import React from 'react';
import { 
  Users, UserCheck, Baby, Wallet, TrendingUp 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { Member, Gender, Role } from '../types';

interface DashboardProps {
  members: Member[];
}

// Updated colors to match the blue theme (Primary: #13395F)
const COLORS = ['#13395F', '#f43f5e', '#3b82f6', '#f59e0b'];

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ members }) => {
  // Calculations
  const totalMembers = members.length;
  const menCount = members.filter(m => m.gender === Gender.HOMME).length;
  const womenCount = members.filter(m => m.gender === Gender.FEMME).length;
  const childCount = members.filter(m => m.gender === Gender.ENFANT).length;
  const totalFees = members.reduce((acc, m) => acc + m.annualFee, 0);

  // Data for Pie Chart (Gender)
  const genderData = [
    { name: 'Hommes', value: menCount, color: '#13395F' }, // Brand blue
    { name: 'Femmes', value: womenCount, color: '#f43f5e' },
    { name: 'Enfants', value: childCount, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Data for Bar Chart (Roles)
  const roleCounts: Record<string, number> = {};
  Object.values(Role).forEach(role => roleCounts[role] = 0);
  members.forEach(m => {
    if (roleCounts[m.role] !== undefined) {
      roleCounts[m.role]++;
    }
  });
  const roleData = Object.keys(roleCounts).map(role => ({
    name: role,
    count: roleCounts[role]
  })).filter(r => r.count > 0); // Only show roles that have members

  // Data for Line Chart (Fee Progression over time)
  // Group by Month/Year
  const sortedMembers = [...members].sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
  let cumulativeFees = 0;
  const timelineData = sortedMembers.map(m => {
    cumulativeFees += m.annualFee;
    return {
      date: new Date(m.joinDate).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      total: cumulativeFees
    };
  });
  // Sample down if too many data points
  const displayTimeline = timelineData.length > 20 
    ? timelineData.filter((_, i) => i % Math.ceil(timelineData.length / 20) === 0)
    : timelineData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tableau de Bord</h2>
          <p className="text-slate-500">Aperçu général de la situation du Dahira</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Membres Totaux" 
          value={totalMembers} 
          icon={Users} 
          color="bg-brand-600"
        />
        <StatCard 
          title="Cotisations" 
          value={`${totalFees.toLocaleString('fr-FR')} F`} 
          icon={Wallet} 
          color="bg-emerald-500" // Keep money green
          subtext="Total attendu"
        />
        <StatCard 
          title="Hommes" 
          value={menCount} 
          icon={UserCheck} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Femmes" 
          value={womenCount} 
          icon={UserCheck} 
          color="bg-pink-500" 
        />
        <StatCard 
          title="Enfants" 
          value={childCount} 
          icon={Baby} 
          color="bg-indigo-500" 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Baby size={20} className="text-slate-400" />
            Répartition par Genre
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => [value, 'Membres']} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Progression */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-slate-400" />
            Progression des Cotisations
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
                <RechartsTooltip formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Cumul']} />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
         <h3 className="text-lg font-semibold text-slate-800 mb-4">Membres par Fonction</h3>
         <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData} layout="vertical" margin={{ left: 150 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={220} stroke="#64748b" fontSize={11} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#13395F" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};