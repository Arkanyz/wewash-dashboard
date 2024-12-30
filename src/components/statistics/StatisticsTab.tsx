import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, Euro, Calendar, Download, Printer, ArrowUp, ArrowDown } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const mockData = {
  revenue: {
    current: 15780,
    previous: 12450,
    data: [4200, 4500, 4800, 4300, 4900, 5200, 4800, 5100, 5400, 5200, 5600, 5800],
  },
  customers: {
    current: 342,
    previous: 310,
    data: [95, 102, 98, 105, 108, 110, 115, 118, 120, 125, 128, 130],
  },
  usage: {
    current: 1250,
    previous: 1180,
    data: [280, 290, 285, 295, 300, 310, 305, 315, 320, 325, 330, 335],
  },
  popular: [
    { machine: 'Machine 1', uses: 450 },
    { machine: 'Machine 2', uses: 380 },
    { machine: 'Machine 3', uses: 320 },
    { machine: 'Machine 4', uses: 290 },
    { machine: 'Machine 5', uses: 260 },
  ]
};

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const StatisticsTab: React.FC = () => {
  const [timeframe, setTimeframe] = useState('year');

  const getPercentageChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const revenueData = {
    labels: months,
    datasets: [
      {
        label: 'Revenus',
        data: mockData.revenue.data,
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const usageData = {
    labels: months,
    datasets: [
      {
        label: 'Utilisation',
        data: mockData.usage.data,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="h-6 w-6" />
            Statistiques
          </h1>
          <p className="text-gray-400 mt-1">Analyse détaillée de votre activité</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Imprimer
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Time Frame Selector */}
      <div className="flex gap-2 bg-gray-800 p-1 rounded-lg w-fit">
        {['month', 'quarter', 'year'].map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeframe === period ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setTimeframe(period)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-gray-800 p-6 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Euro className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-400">Revenus</p>
                <h3 className="text-2xl font-bold">{mockData.revenue.current.toLocaleString()}€</h3>
              </div>
            </div>
            <div className={`flex items-center ${
              Number(getPercentageChange(mockData.revenue.current, mockData.revenue.previous)) > 0
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
              {Number(getPercentageChange(mockData.revenue.current, mockData.revenue.previous)) > 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span className="ml-1">
                {Math.abs(Number(getPercentageChange(mockData.revenue.current, mockData.revenue.previous)))}%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800 p-6 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400">Clients</p>
                <h3 className="text-2xl font-bold">{mockData.customers.current}</h3>
              </div>
            </div>
            <div className={`flex items-center ${
              Number(getPercentageChange(mockData.customers.current, mockData.customers.previous)) > 0
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
              {Number(getPercentageChange(mockData.customers.current, mockData.customers.previous)) > 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span className="ml-1">
                {Math.abs(Number(getPercentageChange(mockData.customers.current, mockData.customers.previous)))}%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800 p-6 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-gray-400">Utilisations</p>
                <h3 className="text-2xl font-bold">{mockData.usage.current}</h3>
              </div>
            </div>
            <div className={`flex items-center ${
              Number(getPercentageChange(mockData.usage.current, mockData.usage.previous)) > 0
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
              {Number(getPercentageChange(mockData.usage.current, mockData.usage.previous)) > 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span className="ml-1">
                {Math.abs(Number(getPercentageChange(mockData.usage.current, mockData.usage.previous)))}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-6">Revenus mensuels</h3>
          <div className="h-80">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-6">Utilisation mensuelle</h3>
          <div className="h-80">
            <Bar data={usageData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Popular Machines */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-6">Machines les plus utilisées</h3>
        <div className="space-y-4">
          {mockData.popular.map((machine, index) => (
            <div key={machine.machine} className="flex items-center">
              <div className="w-32 text-gray-400">{machine.machine}</div>
              <div className="flex-1">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(machine.uses / mockData.popular[0].uses) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
              <div className="w-20 text-right text-gray-400">{machine.uses} uses</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;
