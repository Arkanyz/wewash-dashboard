import React, { useEffect } from 'react';
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
}

interface AllRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: Recommendation[];
  selectedRecommendation: Recommendation | null;
}

const AllRecommendationsModal: React.FC<AllRecommendationsModalProps> = ({
  isOpen,
  onClose,
  recommendations,
  selectedRecommendation
}) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-white" />;
      case 'cost':
        return <TrendingUp className="w-5 h-5 text-white" />;
      case 'partnership':
        return <Users className="w-5 h-5 text-white" />;
      case 'customer':
        return <MessageSquare className="w-5 h-5 text-white" />;
      default:
        return <TrendingUp className="w-5 h-5 text-white" />;
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

  // Effet pour scroller vers la recommandation sélectionnée
  useEffect(() => {
    if (selectedRecommendation && isOpen) {
      const element = document.getElementById(`recommendation-${selectedRecommendation.id}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-[#286BD4]', 'ring-offset-2');
        }, 100);
      }
    }
  }, [selectedRecommendation, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Toutes les Recommandations"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            id={`recommendation-${rec.id}`}
            className={`bg-white rounded-xl border border-[#E5E9F2] overflow-hidden transition-all duration-200 ${
              selectedRecommendation?.id === rec.id ? 'ring-2 ring-[#286BD4] ring-offset-2' : ''
            }`}
          >
            <div className="flex flex-col md:flex-row items-start gap-3 p-3 md:p-4">
              <div className={`p-2 md:p-2 rounded-xl bg-gradient-to-r ${getColorForType(rec.type)} self-start`}>
                {getIconForType(rec.type)}
              </div>
              <div className="flex-grow w-full">
                <h3 className="text-sm md:text-base font-medium text-[#1a1a1a] mb-1 md:mb-1">{rec.title}</h3>
                <p className="text-xs md:text-sm text-[#666666] mb-3">{rec.description}</p>
                
                <div className="grid grid-cols-2 gap-2 md:gap-2">
                  <div className="bg-[#FAFBFF] rounded-lg p-2 md:p-2">
                    <p className="text-xs md:text-sm text-[#666666] mb-1">Impact</p>
                    <p className={`text-sm md:text-sm font-medium ${
                      rec.impact.type === 'positive' ? 'text-[#38AF2E]' : 'text-[#FF6666]'
                    }`}>
                      {rec.impact.value}
                    </p>
                  </div>
                  {rec.roi && (
                    <div className="bg-[#FAFBFF] rounded-lg p-2 md:p-2">
                      <p className="text-xs md:text-sm text-[#666666] mb-1">ROI</p>
                      <p className={`text-sm md:text-sm font-medium ${
                        rec.roi.type === 'positive' ? 'text-[#38AF2E]' : 'text-[#FF6666]'
                      }`}>
                        {rec.roi.value}
                      </p>
                    </div>
                  )}
                </div>

                <button className="mt-3 w-full px-3 py-2 bg-[#FAFBFF] hover:bg-[#F5F7FA] text-[#286BD4] rounded-lg text-xs md:text-sm font-medium transition-colors">
                  {rec.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default AllRecommendationsModal;
