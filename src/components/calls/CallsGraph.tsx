import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CallData {
  time: string;
  inbound: number;
  outbound: number;
  missed: number;
}

// Données simulées pour une journée
const generateMockData = (): CallData[] => {
  const data: CallData[] = [];
  for (let hour = 8; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      data.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        inbound: Math.floor(Math.random() * 15),
        outbound: Math.floor(Math.random() * 10),
        missed: Math.floor(Math.random() * 5),
      });
    }
  }
  return data;
};

const CallsGraph: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [data] = useState<CallData[]>(generateMockData());
  const [hoveredData, setHoveredData] = useState<CallData | null>(null);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1A1D1D] p-4 border border-gray-700 rounded-lg shadow-lg">
          <p className="text-[#99E5DC] font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-green-400">Entrants: {data.inbound}</p>
            <p className="text-blue-400">Sortants: {data.outbound}</p>
            <p className="text-red-400">Manqués: {data.missed}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111313] rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-[#99E5DC]" />
          <h2 className="text-xl font-semibold">Analyse des Appels</h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'day'
                ? 'bg-[#99E5DC] text-black'
                : 'bg-[#1A1D1D] text-gray-400 hover:bg-[#222525]'
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'week'
                ? 'bg-[#99E5DC] text-black'
                : 'bg-[#1A1D1D] text-gray-400 hover:bg-[#222525]'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'month'
                ? 'bg-[#99E5DC] text-black'
                : 'bg-[#1A1D1D] text-gray-400 hover:bg-[#222525]'
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1A1D1D] p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">Total Appels</p>
          <p className="text-2xl font-bold text-white">
            {data.reduce((acc, curr) => acc + curr.inbound + curr.outbound + curr.missed, 0)}
          </p>
        </div>
        <div className="bg-[#1A1D1D] p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">Appels Entrants</p>
          <p className="text-2xl font-bold text-green-400">
            {data.reduce((acc, curr) => acc + curr.inbound, 0)}
          </p>
        </div>
        <div className="bg-[#1A1D1D] p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">Appels Sortants</p>
          <p className="text-2xl font-bold text-blue-400">
            {data.reduce((acc, curr) => acc + curr.outbound, 0)}
          </p>
        </div>
        <div className="bg-[#1A1D1D] p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">Appels Manqués</p>
          <p className="text-2xl font-bold text-red-400">
            {data.reduce((acc, curr) => acc + curr.missed, 0)}
          </p>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            onMouseMove={(e: any) => {
              if (e.activePayload) {
                setHoveredData(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="time"
              stroke="#666"
              tick={{ fill: '#666' }}
              interval={2}
            />
            <YAxis stroke="#666" tick={{ fill: '#666' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
            <Line
              type="monotone"
              dataKey="inbound"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
              name="Appels entrants"
            />
            <Line
              type="monotone"
              dataKey="outbound"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              name="Appels sortants"
            />
            <Line
              type="monotone"
              dataKey="missed"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
              name="Appels manqués"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {hoveredData && (
        <div className="mt-4 text-sm text-gray-400">
          Heure sélectionnée : {hoveredData.time} | 
          Entrants : {hoveredData.inbound} | 
          Sortants : {hoveredData.outbound} | 
          Manqués : {hoveredData.missed}
        </div>
      )}
    </div>
  );
};

export default CallsGraph;
