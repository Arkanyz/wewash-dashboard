import React from 'react';
import { motion } from 'framer-motion';
import StatisticsTabs from '../components/statistics/StatisticsTabs';
import { StatisticsHeader } from '../components/statistics/StatisticsHeader';

const Statistics: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      {/* En-tête moderne */}
      <div className="bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-8 w-1 bg-[#286BD4] rounded-full" />
            <h1 className="text-xl font-medium text-[#2B3674]">
              Statistiques
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StatisticsHeader className="mb-6" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white rounded-2xl shadow-[0_10px_50px_rgba(59,_130,_246,_0.1)] p-6"
        >
          <StatisticsTabs />
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;
