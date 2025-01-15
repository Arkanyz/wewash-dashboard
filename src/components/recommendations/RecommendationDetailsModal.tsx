import React from 'react';
import Modal from '../ui/Modal';
import { Wrench, TrendingUp, Users, MessageSquare } from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'maintenance' | 'cost' | 'partnership' | 'customer';
  priority: number;
  title: string;
  description: string;
  impact: {
    value: string;
    type: 'positive' | 'negative';
  };
  roi?: {
    value: string;
    type: 'positive' | 'negative';
  };
  action: string;
  details?: string;
  steps?: string[];
}

interface RecommendationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
}

const RecommendationDetailsModal: React.FC<RecommendationDetailsModalProps> = ({
  isOpen,
  onClose,
  recommendation
}) => {
  if (!recommendation) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-6 h-6 text-white" />;
      case 'cost':
        return <TrendingUp className="w-6 h-6 text-white" />;
      case 'partnership':
        return <Users className="w-6 h-6 text-white" />;
      case 'customer':
        return <MessageSquare className="w-6 h-6 text-white" />;
      default:
        return <TrendingUp className="w-6 h-6 text-white" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'from-orange-500 to-orange-600';
      case 'cost':
        return 'from-emerald-500 to-emerald-600';
      case 'partnership':
        return 'from-blue-500 to-blue-600';
      case 'customer':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recommendation.title}
    >
      <div className="space-y-4 md:space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
          <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-r ${getColorForType(recommendation.type)} self-start`}>
            {getIconForType(recommendation.type)}
          </div>
          <div className="flex-grow">
            <p className="text-sm md:text-base text-[#666666] mb-3 md:mb-4">{recommendation.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-[#FAFBFF] rounded-xl p-3 md:p-4">
                <p className="text-xs md:text-sm text-[#666666] mb-1 md:mb-2">Impact</p>
                <p className={`text-base md:text-lg font-semibold ${
                  recommendation.impact.type === 'positive' ? 'text-[#38AF2E]' : 'text-[#FF6666]'
                }`}>
                  {recommendation.impact.value}
                </p>
              </div>
              
              {recommendation.roi && (
                <div className="bg-[#FAFBFF] rounded-xl p-3 md:p-4">
                  <p className="text-xs md:text-sm text-[#666666] mb-1 md:mb-2">ROI</p>
                  <p className={`text-base md:text-lg font-semibold ${
                    recommendation.roi.type === 'positive' ? 'text-[#38AF2E]' : 'text-[#FF6666]'
                  }`}>
                    {recommendation.roi.value}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Détails */}
        {recommendation.details && (
          <div className="mt-4 md:mt-6">
            <h3 className="text-sm md:text-base font-medium text-[#1a1a1a] mb-2">Détails</h3>
            <p className="text-xs md:text-sm text-[#666666]">{recommendation.details}</p>
          </div>
        )}

        {/* Étapes */}
        {recommendation.steps && recommendation.steps.length > 0 && (
          <div className="mt-4 md:mt-6">
            <h3 className="text-sm md:text-base font-medium text-[#1a1a1a] mb-2 md:mb-3">Étapes à suivre</h3>
            <div className="space-y-2 md:space-y-3">
              {recommendation.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 md:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#FAFBFF] border border-[#E5E9F2] flex items-center justify-center">
                    <span className="text-xs md:text-sm text-[#286BD4]">{index + 1}</span>
                  </div>
                  <p className="text-xs md:text-sm text-[#666666]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton d'action */}
        <button className="w-full mt-4 md:mt-6 px-4 py-2 md:py-3 bg-[#286BD4] hover:bg-[#1D5BB9] text-white rounded-xl text-xs md:text-sm font-medium transition-colors">
          {recommendation.action}
        </button>
      </div>
    </Modal>
  );
};

export default RecommendationDetailsModal;
